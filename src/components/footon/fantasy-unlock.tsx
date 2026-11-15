"use client";

import Link from "next/link";
import { ChevronRight, Lock, Shirt } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { xpForLevel, xpToLevel } from "@/lib/gamification/level";
import { useLevel } from "@/lib/gamification/queries";
import { copy } from "@/lib/gamification/strings";
import { isUnlocked, requiredLevel } from "@/lib/gamification/unlocks";
import { cn } from "@/lib/utils";
import { XpTrack } from "./gamification/level-progress-bar";

/** Shared anatomy of Home's half-width tiles (Fantasy, Quests): icon + title, one caption line, a track. */
export const homeTile = "flex min-w-0 flex-col gap-2 rounded-xl border px-3 py-3";
const chip = "flex size-7 shrink-0 items-center justify-center rounded-sm";

/**
 * Fantasy as a half-width Home tile (next to `QuestsTile`), gated by level (`unlocks.fantasy`, L8).
 * Locked: visible but disabled (not a link, no chevron): the dashed "locked" card, a lock,
 * "Level 8 required" and the XP climb to it (neutral track). Open: solid soft-lime
 * "Fantasy open", and a tap goes to /fantasy.
 */
export function FantasyUnlock({ href = "/fantasy", className }: { href?: string; className?: string }) {
  const lv = useLevel();
  if (!lv) return <Skeleton className={cn("h-[94px] min-w-0 rounded-xl", className)} />;

  const { progress, config, curve } = lv;
  const need = requiredLevel("fantasy", config);

  if (isUnlocked("fantasy", progress.level, config)) {
    return (
      <Link
        href={href}
        aria-label="فانتزی بازه"
        className={cn(
          homeTile,
          "group border-primary-line bg-primary-soft outline-none transition-transform duration-200 ease-spring focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-[0.98]",
          className,
        )}
      >
        <span aria-hidden="true" className="flex items-center gap-2">
          <span className={cn(chip, "bg-primary/15 text-primary")}>
            <Shirt className="size-4" strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">فانتزی باز شد</span>
          <ChevronRight
            className="size-3.5 shrink-0 text-muted-foreground max-[359px]:hidden transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180"
          />
        </span>
        <span aria-hidden="true" className="truncate text-xs text-muted-foreground">
          تیمت را بچین
        </span>
      </Link>
    );
  }

  const start = xpForLevel(progress.level, curve);
  const goal = xpForLevel(need, curve);
  const pct = goal > start ? (progress.totalXp - start) / (goal - start) : 0;
  const toGo = xpToLevel(progress.totalXp, need, curve);

  return (
    <div
      role="group"
      aria-disabled="true"
      aria-label={`فانتزی، ${copy.locked}. ${copy.levelRequired(need)}. ${copy.xpToGo(toGo)}`}
      data-locked="fantasy"
      className={cn(homeTile, "bg-dots border-dashed border-line-strong bg-surface", className)}
    >
      <span aria-hidden="true" className="flex items-center gap-2">
        <span className={cn(chip, "bg-surface-3 text-muted-foreground")}>
          <Lock className="size-3.5" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
          فانتزی<span className="max-[359px]:hidden"> قفله</span>
        </span>
      </span>
      <span aria-hidden="true" className="truncate text-xs text-muted-foreground">
        {copy.levelRequired(need)}
      </span>
      <span aria-hidden="true" className="flex items-center gap-2">
        <XpTrack pct={pct} className="flex-1" />
        <span className="shrink-0 font-display text-[13px] leading-none font-bold whitespace-nowrap">
          {formatNumber(toGo)}
          <span lang="en" className="ms-0.5 text-[11px] font-semibold text-muted-foreground">
            XP
          </span>
        </span>
      </span>
    </div>
  );
}
