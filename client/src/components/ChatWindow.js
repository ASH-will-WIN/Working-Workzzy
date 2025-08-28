import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getConversationMessages } from '../api/messageApi';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

const ChatWindow = ({ conversation, messages, loading, onMessageSent }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [localMessages, setLocalMessages] = useState(messages);

  // Update local messages when props change
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  // Refresh messages periodically for real-time updates
  useEffect(() => {
    if (!conversation) return;

    const interval = setInterval(async () => {
      try {
        const messagesData = await getConversationMessages(conversation.conversationId);
        setLocalMessages(messagesData.messages || []);
      } catch (error) {
        console.error('Failed to refresh messages:', error);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content) => {
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        content: content.trim(),
        receiverId: conversation.otherParticipantId,
        jobId: conversation.jobId || null
      };

      const sentMessage = await sendMessage(messageData);
      
      // Add the new message to local state immediately
      setLocalMessages(prev => [...prev, sentMessage]);
      
      // Notify parent component
      onMessageSent(sentMessage);
      
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // TODO: Show error toast
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-workzzy-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-workzzy-400 to-workzzy-600 rounded-full flex items-center justify-center text-white font-medium">
              {conversation.otherParticipantId.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                User {conversation.otherParticipantId.substring(0, 8)}
              </h3>
              {conversation.jobId && (
                <p className="text-sm text-gray-600">Job conversation</p>
              )}
            </div>
          </div>
          
          {conversation.jobId && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Job Chat
            </span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {localMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9 8a9.013 9.013 0 01-5.314-1.757l-3.42 1.026a.756.756 0 01-.932-.932l1.026-3.42A9.013 9.013 0 013 12c0-4.962 4.037-9 9-9s9 4.037 9 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
            <p className="text-gray-600">Send your first message to begin the conversation</p>
          </div>
        ) : (
          localMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === user.id}
              showTime={index === 0 || 
                new Date(message.createdAt).getTime() - new Date(localMessages[index - 1].createdAt).getTime() > 300000
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
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