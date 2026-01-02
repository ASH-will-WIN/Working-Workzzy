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

const MessageCenter = ({ initialTargetUserId, initialTargetJobId }) => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  // Remove searchQuery and searchResults states

  // Fetch conversations on component mount
  useEffect(() => {
    console.log("MessageCenter useEffect triggered", {
      initialTargetUserId,
      initialTargetJobId,
      locationState: location.state,
    });
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);

        // Determine target from navigation state OR props
        const targetUserId =
          initialTargetUserId || location.state?.targetUserId;
        const targetJobId = initialTargetJobId || location.state?.jobId;
        const targetConvId = location.state?.conversationId;

        if (targetConvId) {
          const targetConversation = data.find(
            (conv) => conv.conversationId === targetConvId
          );
          if (targetConversation) {
            handleSelectConversation(targetConversation);
          }
        } else if (targetUserId) {
          // Find existing conversation with this user (and job if specified)
          const existingConv = data.find(
            (conv) =>
              conv.otherParticipantId === targetUserId &&
              (!targetJobId || conv.jobId === targetJobId)
          );

          if (existingConv) {
            handleSelectConversation(existingConv);
          } else {
            // Virtual conversation for starting a new chat
            // In a real app, you might fetch user details first
            const virtualConv = {
              conversationId: "new",
              otherParticipantId: targetUserId,
              jobId: targetJobId,
              isVirtual: true,
              latestMessage: "",
              unreadCount: 0,
            };
            setSelectedConversation(virtualConv);
            setMessages([]);
            setMessagesLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [location.state, initialTargetUserId, initialTargetJobId]);

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

    // If this was a virtual conversation, we should refresh the list to get the real ID
    if (selectedConversation.isVirtual) {
      setTimeout(async () => {
        const data = await getConversations();
        setConversations(data);
        const realConv = data.find(
          (c) => c.conversationId === newMessage.conversationId
        );
        if (realConv) setSelectedConversation(realConv);
      }, 500);
    } else {
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
    }
  };

  // Remove the handleStartConversation function since it's not used anymore

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded-lg w-1/4 mb-6"></div>
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-800 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-slate-800 rounded w-2/3"></div>
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
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-slate-400">Communicate with users</p>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
          <div
            className="flex flex-col md:flex-row"
            style={{ height: "calc(100vh - 150px)" }}
          >
            {/* Conversation List - Stacked on mobile, sidebar on desktop */}
            <div
              className={`md:w-1/3 border-r border-slate-700 flex flex-col ${
                selectedConversation ? "hidden md:flex" : "flex"
              }`}
              style={{ minHeight: 0 }}
            >
              <div className="flex-shrink-0 p-4 border-b border-slate-700 bg-slate-800">
                <h2 className="font-semibold text-white">Conversations</h2>
                {conversations.length > 0 && (
                  <p className="text-sm text-slate-400 mt-1">
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

            {/* Chat Window - Full width on mobile when selected, main area on desktop */}
            <div
              className={`flex-1 flex flex-col ${
                selectedConversation ? "flex" : "hidden md:flex"
              }`}
              style={{ minHeight: 0 }}
            >
              {selectedConversation ? (
                <>
                  {/* Mobile header with back button */}
                  <div className="md:hidden p-4 border-b border-slate-700 bg-slate-800">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="flex items-center text-wurkzi-600 hover:text-wurkzi-800"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back to conversations
                    </button>
                  </div>
                  <ChatWindow
                    conversation={selectedConversation}
                    messages={messages}
                    loading={messagesLoading}
                    onMessageSent={handleMessageSent}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-slate-800 p-4">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-slate-700 mx-auto mb-4"
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
                    <h3 className="text-lg font-medium text-white mb-2">
                      No conversation selected
                    </h3>
                    <p className="text-slate-400">
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
