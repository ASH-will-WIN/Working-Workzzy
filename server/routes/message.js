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

// Get total unread count (lightweight)
router.get("/unread-count", require("../controllers/messageController").getUnreadCount);

// Job-specific conversation route removed to simplify core messaging

const { prisma } = require("../db");

// Create or get a conversation ID (simplified)
router.post("/conversations", auth, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.user.id;

    if (!otherUserId || otherUserId === userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Create consistent conversation ID
    const conversationId = [userId, otherUserId].sort().join("-");

    // We don't have a separate Conversation model in the current schema.
    // Conversations are implicitly created by messages sharing a conversationId.
    // We just return the ID so the frontend can navigate.
    res.json({ conversationId, otherParticipantId: otherUserId });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

module.exports = router;
