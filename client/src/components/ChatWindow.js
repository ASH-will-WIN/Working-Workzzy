import React, { useState, useEffect, useRef } from "react";
import { sendMessage, getConversationMessages } from "../api/messageApi";
import { useAuth } from "../context/AuthContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const ChatWindow = ({ conversation, messages, loading, onMessageSent }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [localMessages, setLocalMessages] = useState(messages);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Update local messages when props change
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [localMessages]);

  // Load messages once when conversation is selected
  useEffect(() => {
    if (!conversation || conversation.conversationId === "new") {
      setLocalMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setMessagesLoading(true);
        const messagesData = await getConversationMessages(
          conversation.conversationId
        );
        setLocalMessages(messagesData.messages || []);
      } catch (error) {
        console.error("Failed to load messages:", error);
        // Don't show an alert for empty conversations
        if (error.response?.status !== 404 && error.response?.status !== 403) {
          alert("Failed to load messages. Please try again.");
        }
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [conversation]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      } catch (err) {
        // Fallback: manually scroll the messages container
        const messagesContainer = messagesEndRef.current?.parentElement;
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    }
  };

  const handleSendMessage = async (content) => {
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        content: content.trim(),
        receiverId: conversation.otherParticipantId,
        jobId: conversation.jobId || null,
      };

      const sentMessage = await sendMessage(messageData);

      // Add the new message to local state immediately
      setLocalMessages((prev) => [...prev, sentMessage]);

      // Notify parent component
      onMessageSent(sentMessage);

      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      // TODO: Show error toast
    } finally {
      setSending(false);
    }
  };

  const handleReportUser = async () => {
    setShowMenu(false);
    const reason = window.prompt("Please provide a reason for reporting this user:");
    if (reason) {
      try {
        const { createReport } = await import("../api/reportApi");
        await createReport({ reportedId: conversation.otherParticipantId, reason });
        alert("Thank you. We have received your report and will review it shortly.");
      } catch (err) {
        console.error(err);
        alert("Failed to submit report.");
      }
    }
  };

  const handleBlockUser = async () => {
    setShowMenu(false);
    if (window.confirm("Are you sure you want to block this user? You will no longer be able to message each other.")) {
      try {
        // Store blocked users in localStorage for now (simple client-side solution)
        const blockedUsers = JSON.parse(localStorage.getItem("blockedUsers") || "[]");
        if (!blockedUsers.includes(conversation.otherParticipantId)) {
          blockedUsers.push(conversation.otherParticipantId);
          localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers));
        }
        alert("User has been blocked. This conversation will be hidden.");
        // Notify parent or refresh conversations
        window.location.href = "/messages";
      } catch (err) {
        console.error(err);
        alert("Failed to block user.");
      }
    }
  };

  if (loading || messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wurkzi-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header - Sticky top */}
      <div className="sticky top-0 z-10 p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-wurkzi-400 to-wurkzi-600 rounded-full flex items-center justify-center text-white font-medium">
              {conversation.otherParticipantId.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-white">
                User {conversation.otherParticipantId.substring(0, 8)}
              </h3>
              {/* Job-specific features removed for core messaging simplification */}
            </div>
          </div>

          {/* Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Options"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-20">
                <button
                  onClick={handleReportUser}
                  className="block w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report User
                  </div>
                </button>
                <button
                  onClick={handleBlockUser}
                  className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors border-t border-slate-700"
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Block User
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900"
        style={{
          WebkitOverflowScrolling: "touch",
          maxHeight: "calc(100vh - 200px)",
        }}
      >
        {localMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 text-slate-600 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9 8a9.013 9.013 0 01-5.314-1.757l-3.42 1.026a.756.756 0 01-.932-.932l1.026-3.42A9.013 9.013 0 013 12c0-4.962 4.037-9 9-9s9 4.037 9 9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Start the conversation
            </h3>
            <p className="text-slate-400">
              Send your first message to begin the conversation
            </p>
          </div>
        ) : (
          localMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === user.id}
              showTime={
                index === 0 ||
                new Date(message.createdAt).getTime() -
                new Date(localMessages[index - 1].createdAt).getTime() >
                300000
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 border-t border-slate-700 p-4 bg-slate-800 safe-area-bottom">
        <MessageInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={handleSendMessage}
          disabled={sending}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};

export default ChatWindow;
