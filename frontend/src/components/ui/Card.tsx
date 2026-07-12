import { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[8px] border border-[rgba(17,24,21,0.1)] bg-[rgba(255,255,252,0.86)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_22px_60px_rgba(28,36,31,0.08)] backdrop-blur-[14px]",
        className
      )}
      {...props}
    />
  );
}
