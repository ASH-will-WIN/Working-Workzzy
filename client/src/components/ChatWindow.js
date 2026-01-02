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

  // Update local messages when props change
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  if (loading || messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wurkzi-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800">
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

          {/* Job-specific features removed for core messaging simplification */}
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900"
        style={{ WebkitOverflowScrolling: "touch" }}
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
      <div className="border-t border-slate-700 p-4 bg-slate-800">
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
