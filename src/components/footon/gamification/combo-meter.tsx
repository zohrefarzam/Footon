"use client";

import { Flame } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { formatTimes } from "@/lib/gamification/format";
import { useConfig, useProgress } from "@/lib/gamification/queries";
import { copy } from "@/lib/gamification/strings";
import { cn } from "@/lib/utils";

/**
 * In-match combo: right answers in a row. One pip per answer up to the top
 * step (filled amber = right, dashed = still to get), with the steps' XP
 * multipliers under their pips, so the rule is shown, not explained. A wrong
 * answer empties it quietly (no red: the miss already shows on the card).
 * Amber because a combo is a boost. Numbers come from the server and config.
 */
export function ComboMeter({ className }: { className?: string }) {
  const combo = useProgress().data?.combo;
  const steps = useConfig().data?.combo;
  const reduce = useReducedMotion();
  if (!combo || !steps || steps.length === 0) return <div aria-hidden="true" className={cn("h-[60px] rounded-xl border border-line bg-surface", className)} />;

  const top = steps[steps.length - 1].at;
  const next = steps.find((s) => s.at > combo.count) ?? null;
  const hot = combo.multiplier > 1;

  return (
    <div
      role="img"
      aria-label={copy.comboAria(combo.count, combo.multiplier, next)}
      className={cn("flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5", className)}
    >
      <span aria-hidden="true" className={cn("flex size-9 shrink-0 items-center justify-center rounded-sm", combo.count > 0 ? "bg-live-soft text-live" : "bg-surface-3 text-muted-foreground")}>
        <Flame className={cn("size-4", combo.count > 0 && "fill-live/30")} strokeWidth={2.4} />
      </span>
      <div aria-hidden="true" className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold">
          {copy.comboLabel}
          <span className="ms-1.5 font-normal text-muted-foreground">{copy.comboCount(combo.count)}</span>
        </p>
        <ol className="mt-1.5 flex gap-1">
          {Array.from({ length: top }, (_, i) => {
            const filled = i < combo.count;
            const step = steps.find((s) => s.at === i + 1);
            return (
              <li key={i} className="flex flex-1 flex-col items-center gap-0.5">
                <span className="relative block h-1.5 w-full overflow-hidden rounded-full border border-dashed border-line-strong">
                  <motion.span
                    className="absolute inset-0 origin-left rounded-full bg-live rtl:origin-right"
                    initial={false}
                    animate={{ scaleX: filled ? 1 : 0 }}
                    transition={reduce ? { duration: 0 } : filled ? { type: "spring", stiffness: 420, damping: 26, delay: i * 0.04 } : { duration: 0.25 }}
                  />
                </span>
                <span className={cn("h-3 font-display text-[11px] leading-3 font-bold", step && combo.count >= step.at ? "text-live" : "text-muted-foreground")}>
                  {step ? formatTimes(step.multiplier) : ""}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <motion.span
        key={combo.multiplier}
        aria-hidden="true"
        initial={reduce || !hot ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className={cn("shrink-0 rounded-full px-2.5 py-1 font-display text-lg leading-none font-bold", hot ? "bg-live-soft text-live" : "bg-surface-3 text-muted-foreground")}
      >
        {formatTimes(combo.multiplier)}
      </motion.span>
    </div>
  );
}
