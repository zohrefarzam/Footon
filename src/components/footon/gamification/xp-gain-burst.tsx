"use client";

import { motion, useReducedMotion } from "motion/react";

import { Coin } from "@/components/footon/coin";
import { formatNumber, formatSigned, formatTimes } from "@/lib/gamification/format";
import { levelProgress } from "@/lib/gamification/level";
import type { LevelCurve } from "@/lib/gamification/schemas";
import { cn } from "@/lib/utils";

/**
 * "+20 XP" pill that rises in under the island after a rewarded action, with
 * the coins it paid (amber, they're coins) and a short track filling from the
 * old server total to the new one. Combo shows as an amber ×2 (a boost);
 * past the daily soft cap a muted ×0.5 says why the number is smaller.
 * Never interactive, never focus-stealing; the host announces it.
 */
export function XpGainBurst({
  xpGained,
  coinsGained,
  fromXp,
  toXp,
  level,
  reduced,
  comboMultiplier,
  curve,
  maxLevel,
  className,
}: {
  xpGained: number;
  coinsGained: number;
  fromXp: number;
  toXp: number;
  level: number;
  reduced: boolean;
  comboMultiplier: number;
  curve: LevelCurve;
  maxLevel: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const to = levelProgress(toXp, level, curve, maxLevel).pct;
  // a level-up inside this gain starts the new level's track from empty
  const from = Math.min(levelProgress(fromXp, level, curve, maxLevel).pct, to);

  return (
    <motion.div
      aria-hidden="true"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, transition: { duration: 0.2 } }}
      transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 26 }}
      className={cn(
        "pointer-events-none flex w-[220px] flex-col gap-2 rounded-2xl border border-line-raised bg-surface-2 px-4 pt-2.5 pb-3 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.9)]",
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <span className="font-display text-[28px] leading-none font-bold">{formatSigned(xpGained)} XP</span>
        {comboMultiplier > 1 && (
          <span className="rounded-full bg-live-soft px-1.5 py-0.5 font-display text-[13px] leading-none font-bold text-live">{formatTimes(comboMultiplier)}</span>
        )}
        {reduced && <span className="rounded-full bg-surface-3 px-1.5 py-0.5 font-display text-[13px] leading-none font-bold text-muted-foreground">{formatTimes(0.5)}</span>}
        {coinsGained > 0 && (
          <span className="ms-auto inline-flex items-center gap-1 font-display text-lg leading-none font-bold text-live">
            <Coin className="size-4 text-[8px]" />
            {formatNumber(coinsGained)}
          </span>
        )}
      </span>
      <span className="relative block h-1.5 overflow-hidden rounded-full bg-track">
        <motion.span
          className="absolute inset-0 origin-left rounded-full bg-foreground/85 rtl:origin-right"
          initial={{ scaleX: reduce ? to : from }}
          animate={{ scaleX: to }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </span>
    </motion.div>
  );
}
