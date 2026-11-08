"use client";

import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";

import { xpForLevel, xpToLevel } from "@/lib/gamification/level";
import { useLevel } from "@/lib/gamification/queries";
import { fa } from "@/lib/gamification/strings.fa";
import { isUnlocked, requiredLevel } from "@/lib/gamification/unlocks";
import { cn } from "@/lib/utils";
import { XpTrack } from "./gamification/level-progress-bar";

/**
 * Fantasy as a compact Home tile, gated by level (`unlocks.fantasy`, L8).
 * Locked reads as locked: the dashed "locked" card, a lock, "Level 8
 * required" and the XP climb to it (neutral track). Open: solid soft-lime
 * "Fantasy open". Always visible, always links to /fantasy.
 */
export function FantasyUnlock({ href = "/fantasy", className }: { href?: string; className?: string }) {
  const lv = useLevel();
  if (!lv) return <span aria-hidden="true" className={cn("block h-[70px] min-w-0 rounded-xl border border-line bg-surface", className)} />;

  const { progress, config, curve } = lv;
  const need = requiredLevel("fantasy", config);
  const open = isUnlocked("fantasy", progress.level, config);
  const start = xpForLevel(Math.min(progress.level, need), curve);
  const goal = xpForLevel(need, curve);
  const pct = open ? 1 : goal > start ? (progress.totalXp - start) / (goal - start) : 0;
  const toGo = xpToLevel(progress.totalXp, need, curve);

  return (
    <Link
      href={href}
      aria-label={open ? "Fantasy is open" : `Fantasy, ${fa.locked}. ${fa.levelRequired(need)}. ${fa.xpToGo(toGo)}`}
      data-locked={open ? undefined : "fantasy"}
      className={cn(
        "group flex min-w-0 flex-col justify-between gap-2 rounded-xl border px-3.5 py-3 outline-none transition-colors duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/60",
        open ? "border-primary-line bg-primary-soft" : "border-dashed border-line-strong bg-surface hover:bg-[#141417]",
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        {!open && <Lock className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.2} aria-hidden="true" />}
        <span className="truncate text-[13px] font-semibold">
          Fantasy{open ? " open" : <span className="max-[359px]:hidden"> locked</span>}
        </span>
        <ChevronRight
          className="ms-auto size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180"
          aria-hidden="true"
        />
      </span>

      <span aria-hidden="true" className="flex items-center gap-2">
        {open ? (
          <span className="text-xs text-muted-foreground">Build squad</span>
        ) : (
          <>
            <XpTrack pct={pct} className="flex-1" />
            <span dir="rtl" lang="fa" className="fa-scope shrink-0 text-xs whitespace-nowrap text-muted-foreground max-[359px]:hidden">
              {fa.levelRequired(need)}
            </span>
          </>
        )}
      </span>
    </Link>
  );
}
