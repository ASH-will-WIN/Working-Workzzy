import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseClasses =
    "rounded-lg font-medium transition-all duration-200 hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50";

  const variantClasses = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    outline:
      "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary/20",
  };

  const sizeClasses = {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2 px-4 text-base",
    lg: "py-3 px-6 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};