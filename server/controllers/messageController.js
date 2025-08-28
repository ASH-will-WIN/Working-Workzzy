const db = require("../db");

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { content, receiverId, jobId } = req.body;
    const senderId = req.user.id;

    if (!content || !receiverId) {
      return res.status(400).json({ error: "Content and receiver ID are required" });
    }

    // Generate conversation ID (consistent regardless of who sends first)
    const conversationId = [senderId, receiverId].sort().join('-') + (jobId ? `-job-${jobId}` : '');

    // Validate that users can message each other (both must be involved in the job if jobId is provided)
    if (jobId) {
      const job = await db.job.findUnique({
        where: { id: jobId },
        include: {
          applications: {
            where: {
              status: 'ACCEPTED'
            }
          }
        }
      });

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Check if the sender is either the hirer or an accepted worker
      const isHirer = job.hirerId === senderId;
      const isAcceptedWorker = job.applications.some(app => app.workerId === senderId);
      
      // Check if the receiver is either the hirer or an accepted worker
      const isReceiverHirer = job.hirerId === receiverId;
      const isReceiverAcceptedWorker = job.applications.some(app => app.workerId === receiverId);

      if (!((isHirer || isAcceptedWorker) && (isReceiverHirer || isReceiverAcceptedWorker))) {
        return res.status(403).json({ error: "Not authorized to message about this job" });
      }
    }

    const message = await db.message.create({
      data: {
        content,
        senderId,
        receiverId,
        jobId: jobId || null,
        conversationId,
        isRead: false
      }
    });

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

    // Get all unique conversations for the user
    const conversations = await db.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      distinct: ['conversationId']
    });

    // Get the latest message and unread count for each conversation
    const conversationDetails = await Promise.all(
      conversations.map(async (conv) => {
        const latestMessage = await db.message.findFirst({
          where: { conversationId: conv.conversationId },
          orderBy: { createdAt: 'desc' }
        });

        const unreadCount = await db.message.count({
          where: {
            conversationId: conv.conversationId,
            receiverId: userId,
            isRead: false
          }
        });

        // Get the other participant's ID
        const otherParticipantId = latestMessage.senderId === userId ? 
          latestMessage.receiverId : latestMessage.senderId;

        return {
          conversationId: conv.conversationId,
          otherParticipantId,
          jobId: conv.jobId,
          latestMessage: latestMessage.content,
          latestMessageTime: latestMessage.createdAt,
          unreadCount
        };
      })
    );

    res.json(conversationDetails);
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
    const userInConversation = await db.message.findFirst({
      where: {
        conversationId,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!userInConversation) {
      return res.status(403).json({ error: "Not authorized to view this conversation" });
    }

    const messages = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip: offset,
      take: limit
    });

    const totalMessages = await db.message.count({
      where: { conversationId }
    });

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total: totalMessages,
        hasMore: offset + limit < totalMessages
      }
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
    const message = await db.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.receiverId !== userId) {
      return res.status(403).json({ error: "Not authorized to mark this message as read" });
    }

    const updatedMessage = await db.message.update({
      where: { id: messageId },
      data: { isRead: true }
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
    const userInConversation = await db.message.findFirst({
      where: {
        conversationId,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!userInConversation) {
      return res.status(403).json({ error: "Not authorized to access this conversation" });
    }

    // Mark all messages where the user is the receiver as read
    await db.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ message: "Conversation marked as read" });
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    res.status(500).json({ error: "Failed to mark conversation as read" });
  }
};

// Get or create conversation for a specific job
const getJobConversation = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { otherUserId } = req.query;
    const userId = req.user.id;

    if (!otherUserId) {
      return res.status(400).json({ error: "Other user ID is required" });
    }

    // Verify both users are authorized for this job
    const job = await db.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          where: { status: 'ACCEPTED' }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const isUserAuthorized = job.hirerId === userId || 
      job.applications.some(app => app.workerId === userId);
    const isOtherUserAuthorized = job.hirerId === otherUserId || 
      job.applications.some(app => app.workerId === otherUserId);

    if (!isUserAuthorized || !isOtherUserAuthorized) {
      return res.status(403).json({ error: "Not authorized to create conversation for this job" });
    }

    const conversationId = [userId, otherUserId].sort().join('-') + `-job-${jobId}`;

    // Check if conversation already exists
    const existingMessages = await db.message.findFirst({
      where: { conversationId }
    });

    res.json({
      conversationId,
      jobId,
      exists: !!existingMessages
    });
  } catch (error) {
    console.error("Error getting job conversation:", error);
    res.status(500).json({ error: "Failed to get job conversation" });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getConversationMessages,
  markMessageAsRead,
  markConversationAsRead,
  getJobConversation
};