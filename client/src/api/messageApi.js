import { apiClient } from './apiClient';

// Send a new message
export const sendMessage = async (messageData) => {
  const response = await apiClient.post('/messages', messageData);
  return response.data;
};

// Get all conversations for the current user
export const getConversations = async () => {
  const response = await apiClient.get('/messages/conversations');
  return response.data;
};

// Get messages in a specific conversation
export const getConversationMessages = async (conversationId, page = 1, limit = 50) => {
  const response = await apiClient.get(`/messages/conversation/${conversationId}`, {
    params: { page, limit }
  });
  return response.data;
};

// Mark a specific message as read
export const markMessageAsRead = async (messageId) => {
  const response = await apiClient.put(`/messages/${messageId}/read`);
  return response.data;
};

// Mark all messages in a conversation as read
export const markConversationAsRead = async (conversationId) => {
  const response = await apiClient.put(`/messages/conversation/${conversationId}/read`);
  return response.data;
};

// Get or create conversation for a specific job
export const getJobConversation = async (jobId, otherUserId) => {
  const response = await apiClient.get(`/messages/job/${jobId}/conversation`, {
    params: { otherUserId }
  });
  return response.data;
};