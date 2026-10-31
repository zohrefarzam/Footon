import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Match } from "@/lib/mock-data";
import { LiveDot } from "./live";
import { TeamCrest } from "./team-crest";

/**
 * A slim fixture row inside a divided list Card (~60px, so a screen holds many).
 * Start: status column (amber live minute, kickoff time + day, or FT).
 * Middle: two team lines with shield and score. A soft-lime line marks a match
 * you play in one of your leagues. Linked rows get a chevron.
 */
export function MatchRow({ match, href, className }: { match: Match; href?: string; className?: string }) {
  const live = match.status === "live";
  const done = match.status === "finished";
  const scored = live || done;
  const winner = done && match.score ? (match.score[0] === match.score[1] ? -1 : match.score[0] > match.score[1] ? 0 : 1) : -1;

  const status = live ? `Live, ${match.minute} minutes` : done ? "Full time" : `${match.day ?? "Today"} ${match.kickoff}`;

  const body = (
    <>
      <div className="flex w-11 shrink-0 flex-col items-center gap-0.5 text-center">
        {live ? (
          <>
            <LiveDot />
            <span className="font-display text-[17px] leading-none font-bold text-live">{match.minute}&apos;</span>
          </>
        ) : done ? (
          <span className="font-display text-[15px] font-bold text-muted-foreground">FT</span>
        ) : (
          <>
            <span className="font-display text-base leading-none font-bold">{match.kickoff}</span>
            {match.day && <span className="text-[11px] leading-none text-muted-foreground">{match.day}</span>}
          </>
        )}
      </div>

      <div className="w-px self-stretch bg-line" aria-hidden="true" />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {[match.home, match.away].map((t, i) => (
          <div key={t.code} className="flex h-6 items-center gap-2.5">
            <TeamCrest code={t.code} colors={t.colors} size="xs" />
            <span className={cn("min-w-0 flex-1 truncate text-[15px] font-semibold", done && winner !== i && "text-muted-foreground")}>
              {t.name}
            </span>
            {scored && <span className="font-display text-[19px] leading-none font-bold tabular-nums">{match.score?.[i]}</span>}
          </div>
        ))}
        {match.league && (
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs font-medium text-primary">
            <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span className="truncate">{match.caption}</span>
          </span>
        )}
      </div>

      {href && <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />}
    </>
  );

  const row = "flex items-center gap-3 px-4 py-2.5";

  return (
    <div className={cn("[&+&]:border-t [&+&]:border-line", className)}>
      {href ? (
        <Link
          href={href}
          aria-label={`${match.home.name} v ${match.away.name}, ${status}${match.league ? `, in ${match.league}` : ""}`}
          className={cn(row, "outline-none transition-colors hover:bg-[#141417] focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60")}
        >
          {body}
        </Link>
      ) : (
        <div className={row}>
          <span className="sr-only">{status}. </span>
          {body}
        </div>
      )}
    </div>
  );
}
