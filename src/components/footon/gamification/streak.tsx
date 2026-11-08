"use client";

import { CalendarCheck, Snowflake } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/gamification/format";
import { useConfig, useProgress } from "@/lib/gamification/queries";
import type { Streak, StreakUpdate } from "@/lib/gamification/schemas";
import { copy } from "@/lib/gamification/strings";
import { cn } from "@/lib/utils";
import { CelebrationToast } from "./celebration-toast";

/**
 * Day streak: consecutive MATCH days with at least one real prediction. Its
 * glyph is a checked calendar (the in-match combo keeps the flame), amber
 * because a streak is a boost. A broken run reads as 0, never in red.
 */
const live = (s: Streak) => (s.status === "active" ? s.current : 0);

/** Compact chip for the level strip. Hidden while there's no run. */
export function StreakChip({ className }: { className?: string }) {
  const s = useProgress().data?.streak;
  if (!s || live(s) === 0) return null;
  return (
    <span
      role="img"
      aria-label={`${formatNumber(s.current)} ${copy.streakUnit(s.current)}`}
      className={cn("flex shrink-0 items-center gap-0.5 font-display text-[15px] font-bold text-live", className)}
    >
      <CalendarCheck className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
      {formatNumber(s.current)}
    </span>
  );
}

/** Freezes held out of the most you can hold: filled tiles vs dashed slots (shape, not just colour). */
export function FreezeIndicator({ held, max, className }: { held: number; max: number; className?: string }) {
  return (
    <span role="img" aria-label={copy.freezes(held, max)} className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            "flex size-7 items-center justify-center rounded-sm",
            i < held ? "bg-surface-3 text-foreground" : "border border-dashed border-line-strong text-subtle",
          )}
        >
          <Snowflake className="size-3.5" strokeWidth={2.2} />
        </span>
      ))}
    </span>
  );
}

/** Profile's streak card: the run, the best, the next reward and the freezes. */
export function StreakCounter({ className }: { className?: string }) {
  const s = useProgress().data?.streak;
  const config = useConfig().data;
  if (!s || !config) return <Skeleton className={cn("h-[168px] rounded-xl", className)} />;

  const current = live(s);
  const next = config.streak.milestones.find((m) => m > current) ?? null;
  // the run so far against the next reward (3 of 7), so a fresh milestone never reads as empty
  const pct = next ? current / next : 1;

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* same anatomy as the division and league cards: roundel + title, the big number, the strip */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <span
          aria-hidden="true"
          className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", current > 0 ? "bg-live-soft text-live" : "bg-surface-3 text-muted-foreground")}
        >
          <CalendarCheck className="size-[18px]" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{copy.streakTitle}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{copy.bestRun(s.best)}</p>
        </div>
      </div>
      <div className="flex items-end gap-3 px-4 pt-3">
        <p className="font-display text-[44px] leading-[0.9] font-bold">
          {formatNumber(current)}
          <span className="ms-1.5 text-xl text-muted-foreground">{copy.matchDays(current)}</span>
        </p>
      </div>
      <div className="px-4 pt-3 pb-4">
        {current === 0 ? (
          <p className="text-xs text-muted-foreground">{copy.streakNone}</p>
        ) : (
          <>
            <span aria-hidden="true" className="relative block h-2 overflow-hidden rounded-full bg-track">
              <span className="absolute inset-0 origin-left rounded-full bg-live transition-transform duration-700 ease-out-soft rtl:origin-right" style={{ transform: `scaleX(${pct})` }} />
            </span>
            {next && <p className="mt-1.5 text-xs text-muted-foreground">{copy.toMilestone(next - current, next)}</p>}
          </>
        )}
      </div>
      <div className="flex items-center gap-2.5 border-t border-line px-4 py-3">
        <FreezeIndicator held={s.freezesHeld} max={config.streak.maxFreezes} />
        <span className="text-xs text-muted-foreground">{copy.freezes(s.freezesHeld, config.streak.maxFreezes)}</span>
      </div>
    </Card>
  );
}

/** The streak's celebration: the count ticks over from the last number. */
export function StreakTick({ streak, onDismiss }: { streak: StreakUpdate; onDismiss: () => void }) {
  const reduce = useReducedMotion();
  const from = streak.incrementedNow ? streak.current - 1 : streak.current;
  const detail = streak.milestone
    ? copy.milestoneHit(streak.milestone)
    : streak.freezeUsed
      ? copy.freezeUsed
      : streak.best > streak.current
        ? copy.bestRun(streak.best)
        : undefined;

  return (
    <CelebrationToast
      tone="live"
      icon={<CalendarCheck className="size-5" strokeWidth={2.2} />}
      eyebrow={copy.streakEyebrow}
      title={`${formatNumber(streak.current)} ${copy.streakUnit(streak.current)}`}
      detail={detail}
      aside={
        <span aria-hidden="true" className="relative h-9 w-12 shrink-0 overflow-hidden text-end font-display text-[34px] leading-9 font-bold text-live">
          {!reduce && from !== streak.current && (
            <motion.span className="absolute inset-0" initial={{ y: 0, opacity: 1 }} animate={{ y: "-100%", opacity: 0 }} transition={{ duration: 0.35, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}>
              {formatNumber(from)}
            </motion.span>
          )}
          <motion.span
            className="absolute inset-0"
            initial={reduce || from === streak.current ? false : { y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 26, delay: 0.25 }}
          >
            {formatNumber(streak.current)}
          </motion.span>
        </span>
      }
      onDismiss={onDismiss}
      dismissLabel={copy.skip}
    />
  );
}
