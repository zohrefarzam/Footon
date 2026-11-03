import { Zap } from "lucide-react";

import { BOOST_MULTIPLIER } from "@/lib/economy";
import { cn } from "@/lib/utils";

/**
 * A big match: right predictions pay 2x the coins. Amber-soft pill (a boost,
 * like the streak flame and the 2x tokens), lucide Zap + "2x" in display font.
 * `label` adds the words for spots with room ("Wins pay 2x").
 */
export function BoostBadge({ label, size = "sm", className }: { label?: string; size?: "sm" | "md"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full bg-live-soft font-display font-bold text-live",
        size === "sm" ? "h-5 ps-1 pe-1.5 text-[13px]" : "h-7 ps-1.5 pe-2.5 text-base",
        className,
      )}
      role="img"
      aria-label={`${label ?? "Big match, wins pay"} ${BOOST_MULTIPLIER}x`}
    >
      <Zap className={cn("fill-live/30", size === "sm" ? "size-3" : "size-4")} strokeWidth={2.4} aria-hidden="true" />
      {label && (
        <span aria-hidden="true" className="me-1 font-sans text-xs font-semibold">
          {label}
        </span>
      )}
      <span aria-hidden="true">{BOOST_MULTIPLIER}x</span>
    </span>
  );
}
