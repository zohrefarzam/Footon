import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";

import { HOT_STREAK, type Match } from "@/lib/mock-data";
import { cn, ordinal } from "@/lib/utils";
import { StreakFlame } from "./streak";
import { TeamCrest } from "./team-crest";

/**
 * Your latest result: the full-time score, then three broadcast stats (points
 * in lime, calls right, your place) and a right/wrong bar. A league win gets
 * the gold trophy. Points only: coins live on the match's Result tab.
 */
export function ResultCard({
  match: m,
  league,
  href,
  className,
}: {
  match: Match;
  /** The league you played it in, and where you finished. */
  league?: { name: string; rank?: number; players: number };
  href: string;
  className?: string;
}) {
  const you = m.you;
  if (!you || !m.score) return null;
  const [h, a] = m.score;
  const won = league?.rank === 1;

  return (
    <Link
      href={href}
      aria-label={`${m.home.name} ${h}, ${m.away.name} ${a}, full time. You scored ${you.points} points, ${you.right} of ${you.calls} right${league?.rank ? `, ${ordinal(league.rank)} in ${league.name}` : ""}.`}
      className={cn(
        "group flex flex-col gap-3.5 rounded-xl border border-line bg-surface p-4 outline-none transition-colors hover:bg-surface-hover focus-visible:ring-[3px] focus-visible:ring-ring/60",
        className,
      )}
    >
      <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        Full time{m.day ? ` · ${m.day}` : ""}
        <ChevronRight className="ms-auto size-4 transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
      </span>

      <span aria-hidden="true" className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <span className="flex min-w-0 items-center justify-end gap-2">
          <span className={cn("truncate text-sm font-semibold", h < a && "text-muted-foreground")}>{m.home.name}</span>
          <TeamCrest code={m.home.code} colors={m.home.colors} size="sm" />
        </span>
        <span className="rounded-sm bg-surface-2 px-2.5 py-1 font-display text-[26px] leading-none font-bold tabular-nums">
          {h}
          <span className="mx-1.5 text-dim">:</span>
          {a}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <TeamCrest code={m.away.code} colors={m.away.colors} size="sm" />
          <span className={cn("truncate text-sm font-semibold", a < h && "text-muted-foreground")}>{m.away.name}</span>
        </span>
      </span>

      <span aria-hidden="true" className="grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-background/40 rtl:divide-x-reverse">
        <span className="flex flex-col items-center gap-0.5 py-2.5">
          <span className="font-display text-[26px] leading-none font-bold text-primary">+{you.points}</span>
          <span className="text-[11px] text-muted-foreground">points</span>
        </span>
        <span className="flex flex-col items-center gap-0.5 py-2.5">
          <span className="font-display text-[26px] leading-none font-bold">
            {you.right}
            <span className="text-base text-muted-foreground">/{you.calls}</span>
          </span>
          <span className="text-[11px] text-muted-foreground">right</span>
        </span>
        <span className="flex flex-col items-center gap-0.5 py-2.5">
          {league?.rank ? (
            <span className={cn("flex items-center gap-1 font-display text-[26px] leading-none font-bold", won && "text-gold")}>
              {won && <Trophy className="size-4" strokeWidth={2.4} />}
              {ordinal(league.rank)}
            </span>
          ) : (
            <span className="font-display text-[26px] leading-none font-bold text-muted-foreground">–</span>
          )}
          <span className="max-w-full truncate px-1 text-[11px] text-muted-foreground">{league ? league.name : "free table"}</span>
        </span>
      </span>

      <span aria-hidden="true" className="flex items-center gap-3">
        <span className="flex flex-1 gap-1">
          {Array.from({ length: you.calls }, (_, i) => (
            <span key={i} className={cn("flex-1 rounded-full", i < you.right ? "h-2 bg-win" : "h-1 self-center bg-loss")} />
          ))}
        </span>
        {you.streak >= HOT_STREAK && <StreakFlame count={you.streak} />}
      </span>
    </Link>
  );
}
