import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Match } from "@/lib/mock-data";
import { TeamCrest } from "./team-crest";

/**
 * A fixture inside a divided list (Card with rows). Two stacked team lines on the
 * left, a status column on the right: amber LIVE minute, or kickoff time.
 */
export function MatchRow({ match, href, children, className }: { match: Match; href?: string; children?: React.ReactNode; className?: string }) {
  const live = match.status === "live";
  const body = (
    <div className="flex items-center gap-3">
      <div className="flex flex-col gap-1.5">
        <TeamCrest code={match.home.code} colors={match.home.colors} />
        <TeamCrest code={match.away.code} colors={match.away.colors} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        {[match.home, match.away].map((t, i) => (
          <div key={t.code} className="flex h-[34px] items-center justify-between">
            <span className="text-[15px] font-semibold">{t.name}</span>
            {live && <span className="font-display text-[22px] font-bold">{match.score?.[i]}</span>}
          </div>
        ))}
      </div>
      <div className="w-px self-stretch bg-[#232328]" />
      <div className="flex w-[72px] flex-col items-center gap-1 text-center">
        {live ? (
          <span className="font-display text-base font-bold text-live">LIVE {match.minute}&apos;</span>
        ) : (
          <span className="font-display text-[22px] font-bold">{match.kickoff}</span>
        )}
        <span className="text-[11px] leading-tight text-muted-foreground">{match.caption}</span>
      </div>
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-3 p-4 [&+&]:border-t [&+&]:border-line", className)}>
      {href ? (
        <Link href={href} className="-m-2 rounded-lg p-2 transition-colors hover:bg-[#141417]">
          {body}
        </Link>
      ) : (
        body
      )}
      {children}
    </div>
  );
}
