import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Hot streak: correct calls in a row. Amber (it's a boost, like the 2x tokens),
 * flame icon + count in the display font. Pops in once; never loops.
 */
export function StreakFlame({ count, size = "sm", className }: { count: number; size?: "sm" | "md"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex animate-in zoom-in-50 items-center gap-0.5 rounded-full bg-live-soft font-display font-bold text-live duration-300 fill-mode-both",
        size === "sm" ? "h-5 ps-1 pe-1.5 text-[13px]" : "h-7 ps-1.5 pe-2.5 text-base",
        className,
      )}
      aria-label={`${count} in a row`}
    >
      <Flame className={cn("fill-live/30", size === "sm" ? "size-3" : "size-4")} strokeWidth={2.4} aria-hidden="true" />
      <span aria-hidden="true">{count}</span>
    </span>
  );
}
