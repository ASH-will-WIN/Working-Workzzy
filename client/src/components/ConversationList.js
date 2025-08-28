import React from 'react';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-12 h-12 text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9 8a9.013 9.013 0 01-5.314-1.757l-3.42 1.026a.756.756 0 01-.932-.932l1.026-3.42A9.013 9.013 0 013 12c0-4.962 4.037-9 9-9s9 4.037 9 9z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No conversations yet</h3>
        <p className="text-xs text-gray-600">
          Start messaging from a job page to begin a conversation
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => (
        <div
          key={conversation.conversationId}
          onClick={() => onSelectConversation(conversation)}
          className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
            selectedConversation?.conversationId === conversation.conversationId
              ? 'bg-workzzy-50 border-r-2 border-workzzy-500'
              : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  {/* Avatar placeholder */}
                  <div className="w-8 h-8 bg-gradient-to-br from-workzzy-400 to-workzzy-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {conversation.otherParticipantId.substring(0, 2).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    User {conversation.otherParticipantId.substring(0, 8)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTime(conversation.latestMessageTime)}
                  </span>
                </div>
              </div>
              
              <p className={`text-sm truncate ${
                conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
              }`}>
                {truncateMessage(conversation.latestMessage)}
              </p>
              
              {conversation.jobId && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Job Chat
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;