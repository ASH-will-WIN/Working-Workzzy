const express = require("express");
const auth = require("../middleware/auth");
const {
  sendMessage,
  getConversations,
  getConversationMessages,
  markMessageAsRead,
  markConversationAsRead,
  getJobConversation
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

// Get or create conversation for a specific job
router.get("/job/:jobId/conversation", getJobConversation);

module.exports = router;