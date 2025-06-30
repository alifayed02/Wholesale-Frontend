import * as React from "react";
import { cn } from "../../lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "white";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#2F80ED] text-white hover:bg-[#2563EB]",
  secondary: "bg-[#232533] text-[#F3F4F6] border border-[#2A2A35] hover:bg-[#171821]",
  ghost: "bg-transparent text-[#F3F4F6] hover:bg-[#232533] border border-transparent",
  white: "bg-white text-[#4F4F4F] border border-[#E0E0E0] hover:bg-gray-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
        "rounded-lg font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full inline-block align-middle" /> : null}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export default Button; 