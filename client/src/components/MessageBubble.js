import React from "react";

const MessageBubble = ({ message, isOwn, showTime }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-1" : "order-2"}`}>
        {showTime && (
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 text-xs text-slate-400 bg-slate-800 rounded-full">
              {formatDate(message.createdAt)}
            </span>
          </div>
        )}

        <div
          className={`px-4 py-2 rounded-2xl ${isOwn
              ? "bg-wurkzi-500 text-white rounded-br-md"
              : "bg-slate-800 text-white rounded-bl-md"
            }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        <div
          className={`mt-1 flex items-center space-x-1 ${isOwn ? "justify-end" : "justify-start"
            }`}
        >
          <span className="text-xs text-slate-500">
            {formatTime(message.createdAt)}
          </span>
          {isOwn && (
            <div className="flex items-center space-x-1">
              {message.isRead ? (
                <svg
                  className="w-3 h-3 text-wurkzi-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3 h-3 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
