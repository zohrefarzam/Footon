import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { HOT_STREAK, type Match } from "@/lib/mock-data";
import { LiveDot } from "./live";
import { StreakFlame } from "./streak";
import { TeamCrest } from "./team-crest";

/**
 * One-line fixture row, scoreboard style, inside a divided list Card (~60px):
 *   home name + shield · score or kickoff · shield + away name · marker
 * Under the score: amber live minute, the day for fixtures, FT for results. The
 * centre box is amber-soft while live. The end column is yours: points in lime and
 * an amber flame for a hot streak (or calls made, before kickoff), else a chevron.
 * Names fall back to 3-letter codes on narrow screens.
 */
export function MatchRow({ match, href, className }: { match: Match; href?: string; className?: string }) {
  const live = match.status === "live";
  const done = match.status === "finished";
  const upcoming = match.status === "upcoming";
  const you = match.you;
  const hot = !!you && you.streak >= HOT_STREAK;
  const [h, a] = match.score ?? [0, 0];
  const lost = (i: 0 | 1) => done && h !== a && (i === 0 ? h < a : a < h);

  const status = live ? `Live, ${match.minute} minutes` : done ? "Full time" : `${match.day ?? "Today"} ${match.kickoff}`;
  const label = `${match.home.name} ${live || done ? `${h}, ${match.away.name} ${a}` : `v ${match.away.name}`}, ${status}${
    match.league ? `, in your league ${match.league}` : ""
  }${you ? (upcoming ? `, you made ${you.calls} calls` : `, you scored ${you.points} points${hot ? `, ${you.streak} in a row` : ""}`) : ""}`;

  const team = (i: 0 | 1) => {
    const t = i === 0 ? match.home : match.away;
    return (
      <span className={cn("flex min-w-0 items-center gap-2", i === 0 && "flex-row-reverse text-end")}>
        <TeamCrest code={t.code} colors={t.colors} size="xs" />
        <span className={cn("min-w-0 truncate text-sm font-semibold", lost(i) && "text-muted-foreground")}>
          <span className="max-[359px]:hidden">{t.name}</span>
          <span className="font-display text-[15px] tracking-wide min-[360px]:hidden">{t.code}</span>
        </span>
      </span>
    );
  };

  const body = (
    <>
      {team(0)}

      {/* centre: score or kickoff, with the minute / day / FT underneath */}
      <span
        className={cn(
          "flex h-11 w-[58px] flex-col items-center justify-center gap-0.5 rounded-sm",
          live ? "bg-live-soft" : done ? "bg-surface-2" : "",
        )}
      >
        <span className={cn("font-display text-[19px] leading-none font-bold tabular-nums", !live && !done && "text-[17px]")}>
          {live || done ? (
            <>
              {h}
              <span className="mx-1 text-muted-foreground">–</span>
              {a}
            </>
          ) : (
            match.kickoff
          )}
        </span>
        <span className="flex items-center gap-1 text-[11px] leading-none font-semibold">
          {live ? (
            <>
              <LiveDot className="size-[5px]" />
              <span className="font-display text-xs text-live">{match.minute}&apos;</span>
            </>
          ) : done ? (
            <span className="text-muted-foreground">FT</span>
          ) : (
            <span className="font-medium text-muted-foreground">{match.day ?? "Today"}</span>
          )}
        </span>
      </span>

      {team(1)}

      {/* end: your stake if you're in (points + hot-streak flame, or calls made), else a chevron */}
      <span className="flex flex-col items-end justify-center gap-1">
        {you ? (
          upcoming ? (
            <>
              <span className="font-display text-[15px] leading-none font-bold text-primary">{you.calls}</span>
              <span className="text-[11px] leading-none text-muted-foreground">calls</span>
            </>
          ) : (
            <>
              <span className="font-display text-[15px] leading-none font-bold text-primary tabular-nums">+{you.points}</span>
              {hot ? <StreakFlame count={you.streak} /> : <span className="text-[11px] leading-none text-muted-foreground">pts</span>}
            </>
          )
        ) : href ? (
          <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
        ) : null}
      </span>
    </>
  );

  const row = "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_38px] items-center gap-1.5 py-2 ps-2.5 pe-3";

  return (
    <div className={cn("[&+&]:border-t [&+&]:border-line", className)}>
      {href ? (
        <Link
          href={href}
          aria-label={label}
          className={cn(
            row,
            "outline-none transition-colors hover:bg-[#141417] focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60",
          )}
        >
          {body}
        </Link>
      ) : (
        <div className={row} role="group" aria-label={label}>
          {body}
        </div>
      )}
    </div>
  );
}
