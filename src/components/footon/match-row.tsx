import Link from "next/link";
import { ChevronRight, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Match } from "@/lib/mock-data";
import { LiveDot } from "./live";
import { TeamCrest } from "./team-crest";

/**
 * One-line fixture row, scoreboard style, inside a divided list Card (~60px):
 *   home name + shield · score or kickoff · shield + away name · marker
 * Under the score: amber live minute, the day for fixtures, FT for results. The
 * centre box is amber-soft while live. The end marker is a soft-lime "league" badge when you
 * play this match with friends, else a chevron when the row links somewhere.
 * Names fall back to 3-letter codes on narrow screens.
 */
export function MatchRow({ match, href, className }: { match: Match; href?: string; className?: string }) {
  const live = match.status === "live";
  const done = match.status === "finished";
  const [h, a] = match.score ?? [0, 0];
  const lost = (i: 0 | 1) => done && h !== a && (i === 0 ? h < a : a < h);

  const status = live ? `Live, ${match.minute} minutes` : done ? "Full time" : `${match.day ?? "Today"} ${match.kickoff}`;
  const label = `${match.home.name} ${live || done ? `${h}, ${match.away.name} ${a}` : `v ${match.away.name}`}, ${status}${
    match.league ? `, in your league ${match.league}` : ""
  }`;

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
          "flex h-11 w-16 flex-col items-center justify-center gap-0.5 rounded-sm",
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

      <span className="flex justify-end">
        {match.league ? (
          <span className="flex size-5 items-center justify-center rounded-full border border-primary-line bg-primary-soft text-primary">
            <UsersRound className="size-3" strokeWidth={2.4} />
          </span>
        ) : href ? (
          <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" />
        ) : null}
      </span>
    </>
  );

  const row = "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_20px] items-center gap-2 py-2 ps-3 pe-2.5";

  return (
    <div className={cn("[&+&]:border-t [&+&]:border-line", className)}>
      {href ? (
        <Link
          href={href}
          aria-label={label}
          className={cn(row, "outline-none transition-colors hover:bg-[#141417] focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60")}
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
