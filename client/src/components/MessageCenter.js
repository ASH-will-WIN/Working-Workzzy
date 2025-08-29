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
import { searchUsers } from "../api/userApi";

const MessageCenter = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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

  // Handle user search
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      searchUsers(searchQuery).then((results) => setSearchResults(results));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

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

  const handleStartConversation = async (userId) => {
    try {
      const existingConversation = conversations.find(
        (c) => c.otherParticipant.userId === userId
      );
      if (existingConversation) {
        handleSelectConversation(existingConversation);
      } else {
        const conversation = await createConversation(userId);
        setConversations((prev) => [conversation, ...prev]);
        setSelectedConversation(conversation);
        setMessages([]);
      }
      // Clear search
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      alert(`Failed to start conversation: ${error.message}`);
    }
  };

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
                  <div className="w-full max-w-md">
                    <h2 className="text-xl font-bold text-center mb-4">
                      Messages
                    </h2>
                    <div className="bg-white rounded-lg shadow p-4">
                      <h3 className="font-medium mb-3">
                        Start a new conversation
                      </h3>

                      {/* Simple search input */}
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-workzzy-500"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      {/* User results */}
                      {searchResults.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                              onClick={() => handleStartConversation(user.id)}
                            >
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                <span className="font-medium">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                {user.role && (
                                  <p className="text-xs text-gray-500">
                                    {user.role}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : searchQuery && searchQuery.trim().length > 2 ? (
                        <p className="text-center text-gray-500 py-4">
                          No users found
                        </p>
                      ) : (
                        <p className="text-center text-gray-500 py-4">
                          Search for users to start a conversation
                        </p>
                      )}
                    </div>
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
