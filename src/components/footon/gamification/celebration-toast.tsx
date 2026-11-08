"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * A short, non-blocking moment above the dock (streak tick, new badge, quest
 * done). Tap to dismiss; it never takes focus. The host announces its text.
 */
export function CelebrationToast({
  icon,
  eyebrow,
  title,
  detail,
  aside,
  tone = "neutral",
  onDismiss,
  dismissLabel,
}: {
  icon: React.ReactNode;
  eyebrow?: string;
  title: string;
  detail?: React.ReactNode;
  /** Right-hand slot, e.g. a ticking number. */
  aside?: React.ReactNode;
  /** `live` (amber) only for boosts (streaks, combos); `win` (soft lime) for something you completed. */
  tone?: "neutral" | "live" | "win";
  onDismiss: () => void;
  dismissLabel: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onDismiss}
      aria-label={`${title}. ${dismissLabel}`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, transition: { duration: 0.18 } }}
      transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 30 }}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-line-strong bg-surface-2 px-3.5 py-3 text-start shadow-[0_16px_40px_-16px_rgb(0_0_0/0.9)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
    >
      <span
        aria-hidden="true"
        className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", tone === "live" ? "bg-live-soft text-live" : tone === "win" ? "bg-primary-soft text-primary" : "bg-surface-3 text-foreground")}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        {eyebrow && <span className="block text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">{eyebrow}</span>}
        <span className="block text-[15px] font-semibold text-balance">{title}</span>
        {detail && <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>}
      </span>
      {aside}
    </motion.button>
  );
}
