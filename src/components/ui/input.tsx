import * as React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, disabled, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border bg-[#232533] text-[#F3F4F6] placeholder-[#BDBDBD] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-[#2F80ED] transition disabled:opacity-60 disabled:cursor-not-allowed",
        error && "border-[#EF4444] focus:ring-[#EF4444] focus:border-[#EF4444]",
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
);
Input.displayName = "Input";

export default Input; 