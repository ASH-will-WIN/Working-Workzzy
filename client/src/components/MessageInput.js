import React, { useRef, useState } from "react";
import { uploadImageToBase64 } from "../api/jobApi";

const MessageInput = ({ value, onChange, onSend, disabled, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if ((value.trim() || image) && !disabled) {
      try {
        await onSend({ content: value, imageUrl: image?.url || null });
        setImage(null);
        setImageError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        setImageError(error.message || "Unable to send the message.");
      }
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageError("");
    try {
      const url = await uploadImageToBase64(file);
      setImage({ name: file.name, url });
    } catch (error) {
      setImageError(error.message || "Unable to prepare that image.");
      event.target.value = "";
    }
  };

  return (
    <div
      className={`relative border rounded-lg transition-colors ${isFocused
          ? "border-wurkzi-500 ring-1 ring-wurkzi-500"
          : "border-slate-600"
        } bg-slate-900`}
    >
      {image && (
        <div className="relative mx-2 mt-2 w-fit">
          <img src={image.url} alt="Attachment preview" className="h-20 w-20 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => { setImage(null); fileInputRef.current.value = ""; }}
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-slate-700 text-sm text-white"
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex items-end space-x-2 p-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleImageChange}
          className="hidden"
          aria-label="Attach an image"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-slate-700 disabled:opacity-50"
          aria-label="Attach an image"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828a4 4 0 00-5.656-5.656l-7.293 7.293a6 6 0 108.485 8.485L19.5 14" />
          </svg>
        </button>
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
            className="w-full resize-none border-0 outline-none focus:ring-0 placeholder-slate-500 text-base py-2 px-0 max-h-32 bg-transparent"
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
          disabled={(!value.trim() && !image) || disabled}
          className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${(value.trim() || image) && !disabled
              ? "bg-wurkzi-500 text-white hover:bg-wurkzi-600 focus:outline-none focus:ring-2 focus:ring-wurkzi-500 focus:ring-offset-2"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
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
        {imageError && <p className="mb-1 text-xs text-red-400">{imageError}</p>}
        <p className="text-xs text-slate-500">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default MessageInput;
