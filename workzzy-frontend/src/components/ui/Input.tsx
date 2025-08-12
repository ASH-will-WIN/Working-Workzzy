import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 border-2 ${
          error ? "border-error" : "border-primary/20"
        } rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-transparent placeholder:text-primary/50 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};