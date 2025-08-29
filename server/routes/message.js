const express = require("express");
const auth = require("../middleware/auth");
const {
  sendMessage,
  getConversations,
  getConversationMessages,
  markMessageAsRead,
  markConversationAsRead,
  getJobConversation,
} = require("../controllers/messageController");

const router = express.Router();

// All message routes require authentication
router.use(auth);

// Send a new message
router.post("/", sendMessage);

// Get all conversations for the authenticated user
router.get("/conversations", getConversations);

// Get messages in a specific conversation
router.get("/conversation/:conversationId", getConversationMessages);

// Mark a specific message as read
router.put("/:messageId/read", markMessageAsRead);

// Mark all messages in a conversation as read
router.put("/conversation/:conversationId/read", markConversationAsRead);

// Job-specific conversation route removed to simplify core messaging

// Create a new conversation (simplified)
router.post("/conversations", auth, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user.id;

    if (!otherUserId || otherUserId === userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Create consistent conversation ID
    const conversationId = [userId, otherUserId].sort().join("-");

    // Check if conversation already exists
    let conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    // Create if it doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          id: conversationId,
          participants: {
            connect: [{ id: userId }, { id: otherUserId }],
          },
        },
      });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

module.exports = router;
