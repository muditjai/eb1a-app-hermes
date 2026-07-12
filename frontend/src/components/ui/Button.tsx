import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-grid min-h-[54px] place-items-center rounded-[8px] bg-[linear-gradient(135deg,#17201c,#1b765e)] px-6 text-sm font-[820] text-white shadow-[0_14px_28px_rgba(27,118,94,0.2)] transition hover:-translate-y-px hover:shadow-[0_18px_34px_rgba(27,118,94,0.24)] disabled:cursor-not-allowed disabled:bg-[#dde4df] disabled:text-[#8d9993] disabled:shadow-none disabled:hover:translate-y-0",
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
