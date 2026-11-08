"use client";

import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";

import { xpForLevel, xpToLevel } from "@/lib/gamification/level";
import { useLevel } from "@/lib/gamification/queries";
import { copy } from "@/lib/gamification/strings";
import { isUnlocked, requiredLevel } from "@/lib/gamification/unlocks";
import { cn } from "@/lib/utils";
import { XpTrack } from "./gamification/level-progress-bar";

/**
 * Fantasy as a compact Home tile, gated by level (`unlocks.fantasy`, L8).
 * Locked: visible but disabled (not a link, no chevron): the dashed
 * "locked" card, a lock, "Level 8 required" and the XP climb to it (neutral
 * track). Open: solid soft-lime "Fantasy open", and a tap goes to /fantasy.
 */
export function FantasyUnlock({ href = "/fantasy", className }: { href?: string; className?: string }) {
  const lv = useLevel();
  if (!lv) return <span aria-hidden="true" className={cn("block h-[70px] min-w-0 rounded-xl border border-line bg-surface", className)} />;

  const { progress, config, curve } = lv;
  const need = requiredLevel("fantasy", config);
  const tile = "flex min-w-0 flex-col justify-between gap-2 rounded-xl border px-3.5 py-3";

  if (isUnlocked("fantasy", progress.level, config)) {
    return (
      <Link
        href={href}
        aria-label="Fantasy is open"
        className={cn(
          tile,
          "group border-primary-line bg-primary-soft outline-none transition-transform duration-200 ease-spring focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-[0.98]",
          className,
        )}
      >
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-semibold">Fantasy open</span>
          <ChevronRight
            className="ms-auto size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180"
            aria-hidden="true"
          />
        </span>
        <span aria-hidden="true" className="text-xs text-muted-foreground">
          Build squad
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
      aria-label={`Fantasy, ${copy.locked}. ${copy.levelRequired(need)}. ${copy.xpToGo(toGo)}`}
      data-locked="fantasy"
      className={cn(tile, "border-dashed border-line-strong bg-surface", className)}
    >
      <span aria-hidden="true" className="flex items-center gap-1.5">
        <Lock className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.2} />
        <span className="truncate text-[13px] font-semibold">
          Fantasy<span className="max-[359px]:hidden"> locked</span>
        </span>
      </span>
      <span aria-hidden="true" className="flex items-center gap-2">
        <XpTrack pct={pct} className="flex-1" />
        <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground max-[359px]:hidden">{copy.levelRequired(need)}</span>
      </span>
    </div>
  );
}
