const { prisma } = require("../db"); // Make sure to import prisma
const { getUserPhoneNumber, sendSMS } = require("../services/smsService");

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { content, receiverId, jobId } = req.body;
    const senderId = req.user.id;

    if (!content || !receiverId) {
      return res
        .status(400)
        .json({ error: "Content and receiver ID are required" });
    }

    // Generate conversation ID (consistent regardless of who sends first)
    const conversationId =
      [senderId, receiverId].sort().join("-") + (jobId ? `-job-${jobId}` : "");

    // If jobId is provided, validate the users can message about this job
    // If jobId is provided, validate the users can message about this job
    if (jobId) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          applications: true, // Fetch all applications to check status
        },
      });

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // 1. Block if job is completed or cancelled
      if (["COMPLETED", "CANCELLED"].includes(job.status)) {
        return res.status(403).json({
          error: "Messaging is disabled for completed or cancelled jobs",
        });
      }

      // 2. Block if the sender is a worker who has withdrawn
      // Find sender's application if they are not the hirer
      if (job.hirerId !== senderId) {
        const senderApp = job.applications.find(
          (app) => app.workerId === senderId
        );
        if (senderApp && senderApp.status === "WITHDRAWN") {
          return res.status(403).json({
            error: "You cannot message about a job you have withdrawn from",
          });
        }
      }

      // Check if receiver has withdrawn
      if (job.hirerId !== receiverId) {
        const receiverApp = job.applications.find(
          (app) => app.workerId === receiverId
        );
        if (receiverApp && receiverApp.status === "WITHDRAWN") {
          return res.status(403).json({
            error: "You cannot message a worker who has withdrawn from the job",
          });
        }
      }

      const isSenderHirer = job.hirerId === senderId;
      const isReceiverHirer = job.hirerId === receiverId;

      // For pending jobs, allow any user to message the hirer
      if (job.status === "PENDING") {
        if (!(isReceiverHirer || isSenderHirer)) {
          return res.status(403).json({
            error: "For pending jobs, you can only message the job hirer",
          });
        }
      }
      // For non-pending jobs, use the original logic
      else {
        // Re-implementing authorization check with the new `applications` array
        const isSenderValidWorker = job.applications.some(
          (app) => app.workerId === senderId && app.status === "ACCEPTED"
        );
        const isReceiverValidWorker = job.applications.some(
          (app) => app.workerId === receiverId && app.status === "ACCEPTED"
        );

        const isSenderAuthorized = isSenderHirer || isSenderValidWorker;
        const isReceiverAuthorized = isReceiverHirer || isReceiverValidWorker;

        if (!isSenderAuthorized || !isReceiverAuthorized) {
          return res.status(403).json({
            error: "Not authorized to message about this job",
          });
        }
      }
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        jobId: jobId || null,
        conversationId,
        isRead: false,
      },
    });

    // Send SMS notification to receiver if they have a phone number
    try {
      const receiverPhone = await getUserPhoneNumber(receiverId, prisma);
      if (receiverPhone) {
        const senderName = req.user.user_metadata?.name || "Someone";
        const smsContent = `New message from ${senderName}: ${content.substring(
          0,
          100
        )}${content.length > 100 ? "..." : ""}`;
        await sendSMS(receiverPhone, smsContent);
      }
    } catch (smsError) {
      console.error("Error sending SMS notification:", smsError);
      // Don't fail the message send if SMS fails
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // FIX: Use prisma instead of db
    // Get all unique conversations for the user
    const conversations = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: [
        { conversationId: "asc" },
        { createdAt: "desc" }
      ],
      distinct: ["conversationId"],
    });

    // Get the latest message and unread count for each conversation
    const conversationDetails = await Promise.all(
      conversations.map(async (conv) => {
        // If there is a jobId, check if the conversation should be hidden
        if (conv.jobId) {
          const job = await prisma.job.findUnique({
            where: { id: conv.jobId },
            include: { applications: true }
          });

          // If job doesn't exist (maybe deleted), or is completed/cancelled, hide it
          if (!job || ["COMPLETED", "CANCELLED"].includes(job.status)) {
            return null;
          }

          // If user is a worker and has withdrawn, hide it
          if (job.hirerId !== userId) {
            const userApp = job.applications.find(app => app.workerId === userId);
            if (userApp && userApp.status === "WITHDRAWN") {
              return null;
            }
          }
        }

        // FIX: Use prisma instead of db
        const latestMessage = await prisma.message.findFirst({
          where: { conversationId: conv.conversationId },
          orderBy: { createdAt: "desc" },
        });

        // FIX: Use prisma instead of db
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.conversationId,
            receiverId: userId,
            isRead: false,
          },
        });

        // Get the other participant's ID
        const otherParticipantId =
          latestMessage.senderId === userId
            ? latestMessage.receiverId
            : latestMessage.senderId;

        return {
          conversationId: conv.conversationId,
          otherParticipantId,
          jobId: conv.jobId,
          latestMessage: latestMessage.content,
          latestMessageTime: latestMessage.createdAt,
          unreadCount,
        };
      })
    );

    // Filter out nulls (hidden conversations)
    const filteredConversations = conversationDetails.filter(c => c !== null);

    res.json(filteredConversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
};

// Get messages in a specific conversation
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Verify user is part of this conversation
    // FIX: Use prisma instead of db
    const userInConversation = await prisma.message.findFirst({
      where: {
        conversationId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    if (!userInConversation) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this conversation" });
    }

    // FIX: Use prisma instead of db
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      skip: offset,
      take: limit,
    });

    // FIX: Use prisma instead of db
    const totalMessages = await prisma.message.count({
      where: { conversationId },
    });

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total: totalMessages,
        hasMore: offset + limit < totalMessages,
      },
    });
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    // Verify the user is the receiver of this message
    // FIX: Use prisma instead of db
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.receiverId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to mark this message as read" });
    }

    // FIX: Use prisma instead of db
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
};

// Mark all messages in a conversation as read
const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of this conversation
    // FIX: Use prisma instead of db
    const userInConversation = await prisma.message.findFirst({
      where: {
        conversationId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    if (!userInConversation) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this conversation" });
    }

    // Mark all messages where the user is the receiver as read
    // FIX: Use prisma instead of db
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: "Conversation marked as read" });
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    res.status(500).json({ error: "Failed to mark conversation as read" });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
    res.json({ count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getConversationMessages,
  markMessageAsRead,
  markConversationAsRead,
  getUnreadCount,
};
