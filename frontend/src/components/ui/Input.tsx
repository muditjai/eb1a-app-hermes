import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "min-h-12 w-full rounded-[8px] border border-[rgba(17,24,21,0.13)] bg-white/90 px-4 text-sm text-[#17201c] outline-none transition placeholder:text-[#87918c] focus:border-[#1b765e] focus:bg-white focus:ring-4 focus:ring-[rgba(27,118,94,0.11)]",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
