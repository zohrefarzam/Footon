"use client";

import Link from "next/link";
import { Award } from "lucide-react";

import { faNum } from "@/lib/gamification/format";
import { useLevel } from "@/lib/gamification/queries";
import { fa } from "@/lib/gamification/strings.fa";
import { cn } from "@/lib/utils";
import { TIER_ICON } from "./tier-badge";
import { FaScope } from "./fa-scope";

/**
 * The XP track itself: neutral fill (it never competes with the screen's one
 * lime action), drawn with `scaleX` from the inline start, so it fills
 * right-to-left inside RTL. `pct` is 0–1 from the server's totals.
 */
export function XpTrack({ pct, className, fillClassName }: { pct: number; className?: string; fillClassName?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative block h-1.5 min-w-0 overflow-hidden rounded-full bg-[#27272a]", className)}>
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
 * Level · XP · badges strip under the live island on every dock tab. Reads the
 * server's progress; the bar only draws where totalXp sits inside the
 * server's level. Links to the Level card on Profile.
 */
export function LevelProgressBar({ className }: { className?: string }) {
  const lv = useLevel();

  if (!lv) return <span aria-hidden="true" className={cn("block h-9 rounded-full border border-line bg-surface", className)} />;

  const { progress, bar, tier } = lv;
  const Icon = TIER_ICON[tier.id];
  const label = bar.isMax
    ? `${fa.levelN(progress.level)}، ${tier.name}، ${fa.maxLevel}، ${fa.badges(progress.badgeCount)}`
    : `${fa.levelN(progress.level)}، ${tier.name}، ${fa.xpOf(bar.into, bar.span)} تا ${fa.levelN(progress.level + 1)}، ${fa.badges(progress.badgeCount)}`;

  return (
    <FaScope className={className}>
      <Link
        href="/me#level"
        aria-label={label}
        className="flex h-9 items-center gap-2.5 rounded-full border border-line bg-surface ps-1 pe-3 outline-none transition-[transform,background-color] duration-200 ease-spring hover:bg-[#141417] focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-[0.98]"
      >
        <span className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-surface-3 px-2.5 font-display text-[15px] leading-none font-bold">
          <Icon className="size-3.5 text-muted-foreground" strokeWidth={2.2} aria-hidden="true" />
          <span className="text-[11px] text-muted-foreground">{fa.levelShort}</span>
          {faNum(progress.level)}
        </span>
        <XpTrack pct={bar.pct} className="flex-1" />
        <span aria-hidden="true" className="shrink-0 font-display text-[13px] font-bold text-muted-foreground">
          {bar.isMax ? (
            fa.maxLevel
          ) : (
            <bdi>
              <span className="text-foreground">{faNum(bar.into)}</span>/{faNum(bar.span)} XP
            </bdi>
          )}
        </span>
        <span aria-hidden="true" className="flex shrink-0 items-center gap-0.5 border-s border-line ps-2.5 font-display text-[15px] font-bold">
          <Award className="size-3.5 text-muted-foreground" strokeWidth={2.2} />
          {faNum(progress.badgeCount)}
        </span>
      </Link>
    </FaScope>
  );
}
