import React, { useState } from "react";

const MessageInput = ({ value, onChange, onSend, disabled, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value);
    }
  };

  return (
    <div
      className={`relative border rounded-lg transition-colors ${
        isFocused
          ? "border-workzzy-500 ring-1 ring-workzzy-500"
          : "border-gray-300"
      }`}
    >
      <div className="flex items-end space-x-2 p-2">
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none border-0 outline-none focus:ring-0 placeholder-gray-500 text-sm py-2 px-0 max-h-32"
            style={{
              minHeight: "20px",
              height: "auto",
              overflow: "hidden",
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 128) + "px";
            }}
            aria-label={placeholder}
            aria-describedby="message-instructions"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            value.trim() && !disabled
              ? "bg-workzzy-500 text-white hover:bg-workzzy-600 focus:outline-none focus:ring-2 focus:ring-workzzy-500 focus:ring-offset-2"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          {disabled ? (
            <div
              className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"
              aria-hidden="true"
            ></div>
          ) : (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>

      <div className="px-3 pb-2">
        <p className="text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default MessageInput;
