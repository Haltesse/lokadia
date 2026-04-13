import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "info" | "vigilance" | "urgent" | "safe" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({ children, variant = "neutral", size = "md", className = "" }: BadgeProps) {
  const variantStyles = {
    info: "bg-blue-100 text-blue-800",
    vigilance: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
    safe: "bg-green-100 text-green-800",
    neutral: "bg-gray-100 text-gray-800",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
