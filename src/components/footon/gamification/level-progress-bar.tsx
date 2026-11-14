"use client";

import Link from "next/link";
import { Award } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/gamification/format";
import { useLevel, useProgress } from "@/lib/gamification/queries";
import { copy } from "@/lib/gamification/strings";
import { cn } from "@/lib/utils";
import { Coin } from "../coin";
import { StreakChip } from "./streak";
import { TIER_ICON } from "./tier-badge";

/**
 * The XP track itself: neutral fill (it never competes with the screen's one
 * lime action), drawn with `scaleX` from the inline start (so it would flip
 * under a future RTL layout). `pct` is 0–1 from the server's totals.
 */
export function XpTrack({ pct, className, fillClassName }: { pct: number; className?: string; fillClassName?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative block h-1.5 min-w-0 overflow-hidden rounded-full bg-track", className)}>
      <span
        className={cn(
          "absolute inset-0 origin-left rounded-full bg-foreground/85 transition-transform duration-700 ease-out-soft rtl:origin-right",
          fillClassName,
        )}
        style={{ transform: `scaleX(${Math.min(1, Math.max(0, pct))})` }}
      />
    </span>
  );
}

/**
 * The top bar of every dock tab: level • XP • streak • badges (→ the Level card
 * on Profile) and, at the end, the wallet (→ /wallet). Two links in one pill.
 * Reads the server's progress and balance; `coins` is the fallback until it loads.
 */
export function LevelProgressBar({ coins: fallback, className }: { coins: number; className?: string }) {
  const lv = useLevel();
  const coins = useProgress().data?.coins.free ?? fallback;
  const pill = cn("flex h-11 items-center rounded-full border border-line bg-surface", className);

  const wallet = (
    <Link
      href="/wallet"
      aria-label={`${formatNumber(coins)} سکه. باز کردن کیف پول`}
      className="flex h-full shrink-0 items-center gap-1.5 rounded-e-full border-s border-line ps-2.5 pe-1.5 outline-none transition-[transform,background-color] duration-200 ease-spring hover:bg-surface-hover focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-95"
    >
      <span className="font-display text-[17px] leading-none font-bold">{formatNumber(coins)}</span>
      <Coin className="size-[26px] text-[13px]" />
    </Link>
  );

  if (!lv)
    return (
      <div className={pill}>
        <Skeleton className="ms-1.5 me-2.5 h-8 flex-1 rounded-full" />
        {wallet}
      </div>
    );

  const { progress, bar, tier } = lv;
  const Icon = TIER_ICON[tier.id];
  const label = bar.isMax
    ? `${copy.levelN(progress.level)}، ${tier.name}، ${copy.maxLevel}، ${copy.badges(progress.badgeCount)}`
    : `${copy.levelN(progress.level)}، ${tier.name}، ${copy.xpOf(bar.into, bar.span)} تا ${copy.levelN(progress.level + 1)}، ${copy.badges(progress.badgeCount)}`;

  return (
    <div className={pill}>
      <Link
        href="/me#level"
        aria-label={label}
        className="flex h-full min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-s-full ps-1.5 pe-2.5 outline-none transition-[transform,background-color] duration-200 ease-spring hover:bg-surface-hover focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-[0.98]"
      >
        <span className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-surface-3 px-2.5 font-display text-[15px] leading-none font-bold">
          <Icon className="size-3.5 text-muted-foreground" strokeWidth={2.2} aria-hidden="true" />
          <span className="text-[11px] text-muted-foreground">{copy.levelShort}</span>
          {formatNumber(progress.level)}
        </span>
        <XpTrack pct={bar.pct} className="min-w-6 flex-1" />
        <span aria-hidden="true" className="shrink-0 font-display text-[13px] font-bold text-muted-foreground max-[399px]:hidden">
          {bar.isMax ? (
            copy.maxLevel
          ) : (
            <>
              <span className="text-foreground">{formatNumber(bar.into)}</span>/{formatNumber(bar.span)} XP
            </>
          )}
        </span>
        <StreakChip className="border-s border-line ps-2.5" />
        <span aria-hidden="true" className="flex shrink-0 items-center gap-0.5 border-s border-line ps-2.5 font-display text-[15px] font-bold max-[359px]:hidden">
          <Award className="size-3.5 text-muted-foreground" strokeWidth={2.2} />
          {formatNumber(progress.badgeCount)}
        </span>
      </Link>
      {wallet}
    </div>
  );
}
