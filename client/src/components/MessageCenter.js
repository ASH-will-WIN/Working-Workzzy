import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getConversations,
  getConversationMessages,
  markConversationAsRead,
  createConversation,
} from "../api/messageApi";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
// Remove the import for searchUsers since it's no longer used

const MessageCenter = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  // Remove searchQuery and searchResults states

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);

        // Check if we should auto-select a conversation from navigation state
        if (location.state?.conversationId) {
          const targetConversation = data.find(
            (conv) => conv.conversationId === location.state.conversationId
          );
          if (targetConversation) {
            handleSelectConversation(targetConversation);

            // If this is a new conversation, focus the message input
            if (location.state.focusNew) {
              setTimeout(() => {
                const messageInput = document.querySelector("textarea");
                if (messageInput) messageInput.focus();
              }, 500);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [location.state]);

  // Remove the useEffect for user search

  // Refresh conversations periodically for real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (error) {
        console.error("Failed to refresh conversations:", error);
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle conversation selection
  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setMessagesLoading(true);

    try {
      // Fetch messages for the selected conversation
      const messagesData = await getConversationMessages(
        conversation.conversationId
      );
      setMessages(messagesData.messages || []);

      // Mark conversation as read
      await markConversationAsRead(conversation.conversationId);

      // Update the conversation's unread count locally
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversationId === conversation.conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handle new message sent
  const handleMessageSent = (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);

    // Update the conversation's latest message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.conversationId === selectedConversation.conversationId
          ? {
              ...conv,
              latestMessage: newMessage.content,
              latestMessageTime: newMessage.createdAt,
            }
          : conv
      )
    );
  };

  // Remove the handleStartConversation function since it's not used anymore

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-workzzy-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4 mb-6"></div>
            <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-workzzy-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with users</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden">
          <div className="flex h-96 lg:h-[600px]">
            {/* Conversation List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
                {conversations.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {conversations.reduce(
                      (total, conv) => total + conv.unreadCount,
                      0
                    )}{" "}
                    unread
                  </p>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                <ConversationList
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  onSelectConversation={handleSelectConversation}
                />
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  messages={messages}
                  loading={messagesLoading}
                  onMessageSent={handleMessageSent}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9 8a9.013 9.013 0 01-5.314-1.757l-3.42 1.026a.756.756 0 01-.932-.932l1.026-3.42A9.013 9.013 0 013 12c0-4.962 4.037-9 9-9s9 4.037 9 9z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No conversation selected
                    </h3>
                    <p className="text-gray-500">
                      Select a conversation from the list or start one from a
                      job application.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;
