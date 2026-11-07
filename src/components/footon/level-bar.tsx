import Link from "next/link";
import { Award } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * XP · Level · Badges, as a slim bar at the top of every dock tab, under the
 * live island. Placeholder until the gamification doc lands: it reads
 * `profile.level / xp / xpNext / badges` and links to the level card on Profile.
 * The XP fill is neutral so it never competes with the screen's one lime action.
 */
export function LevelBar({ level, xp, xpNext, badges, className }: { level: number; xp: number; xpNext: number; badges: number; className?: string }) {
  const pct = Math.min(100, Math.round((xp / xpNext) * 100));
  const fmt = (n: number) => n.toLocaleString("en-US");
  return (
    <Link
      href="/me#level"
      aria-label={`Level ${level}, ${fmt(xp)} of ${fmt(xpNext)} XP to level ${level + 1}, ${badges} badges`}
      className={cn(
        "flex h-9 items-center gap-2.5 rounded-full border border-line bg-surface ps-1 pe-3 outline-none transition-[transform,background-color] duration-200 ease-spring hover:bg-surface-hover active:scale-[0.98] focus-visible:ring-[3px] focus-visible:ring-ring/60",
        className,
      )}
    >
      <span className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-surface-3 px-2.5 font-display text-[15px] leading-none font-bold">
        <span className="text-[11px] text-muted-foreground">LV</span>
        {level}
      </span>
      <span aria-hidden="true" className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-track">
        <span className="absolute inset-y-0 start-0 rounded-full bg-foreground/85" style={{ width: `${pct}%` }} />
      </span>
      <span aria-hidden="true" className="shrink-0 font-display text-[13px] font-bold text-muted-foreground tabular-nums">
        <span className="text-foreground">{fmt(xp)}</span>/{fmt(xpNext)} XP
      </span>
      <span aria-hidden="true" className="flex shrink-0 items-center gap-0.5 border-s border-line ps-2.5 font-display text-[15px] font-bold">
        <Award className="size-3.5 text-muted-foreground" strokeWidth={2.2} />
        {badges}
      </span>
    </Link>
  );
}
