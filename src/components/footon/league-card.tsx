import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { ChallengeWithMatch } from "@/lib/challenges";
import { YOU_INITIAL, type Standing } from "@/lib/mock-data";
import { cn, ordinal } from "@/lib/utils";
import { LeagueBadge } from "./league-badge";
import { LiveDot } from "./live";
import { Standings } from "./standings";
import { formatNumber, matchup } from "@/lib/format";
import { matchWhen } from "@/lib/dates";

/** "۵۰ امتیاز جلوتر از سارا" / "۲۰ امتیاز عقب‌تر از امید" / "هم‌امتیاز با سارا": the rivalry in one line. */
export function gapLine(rows: Standing[]) {
  const i = rows.findIndex((r) => r.you);
  if (i < 0) return undefined;
  const you = rows[i]!;
  const rival = i === 0 ? rows[1] : rows[i - 1];
  if (!rival) return undefined;
  const d = Math.abs(you.points - rival.points);
  if (d === 0) return `هم‌امتیاز با ${rival.name}`;
  return i === 0 ? `${formatNumber(d)} امتیاز جلوتر از ${rival.name}` : `${formatNumber(d)} امتیاز عقب‌تر از ${rival.name}`;
}

/**
 * A friends' league as a competition card: roundel badge, name, the match it's
 * on, who's in, your place in big numbers with the gap to your nearest rival,
 * then the table itself and a link to the full standings.
 */
export function LeagueCard({ league: c, href, className }: { league: ChallengeWithMatch; href: string; className?: string }) {
  const m = c.match;
  const live = m.status === "live";
  const rows = c.table ?? [];
  const you = rows.findIndex((r) => r.you);
  const when = matchWhen(m);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center gap-3 px-4 pt-4">
        <LeagueBadge name={c.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{c.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {live && <LiveDot className="size-[5px]" />}
            <span className="font-display text-[13px] font-bold">
              {matchup(m.home.code, m.away.code)}
            </span>
            <span className={cn("font-display text-[13px] font-bold", live && "text-live")}>{when}</span>
            <span className="truncate">• {formatNumber(c.members.length)} بازیکن</span>
          </p>
        </div>
        <AvatarGroup aria-hidden="true" className="ring-surface">
          {c.members.slice(0, 4).map((x) => (
            <Avatar key={x} className="size-6">
              <AvatarFallback className={cn("text-[11px]", x === YOU_INITIAL && "bg-primary text-primary-foreground")}>{x}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>

      {you >= 0 && (
        <div className="flex items-end gap-3 px-4 pt-3">
          <p className="font-display text-[44px] leading-[0.9] font-bold text-primary">
            {ordinal(you + 1)}
            <span className="ms-1.5 text-xl text-muted-foreground">از {formatNumber(rows.length)}</span>
          </p>
          <p className="ms-auto pb-1 text-end text-[13px] font-semibold">{gapLine(rows)}</p>
        </div>
      )}

      {rows.length > 0 && <Standings rows={rows} caption={`جدول ${c.name}`} compact className="mt-1" />}

      <Link
        href={href}
        className="flex h-11 items-center gap-1 border-t border-line px-4 text-[13px] font-semibold text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60"
      >
        {live ? "برگشت به بازی" : "باز کردن لیگ"}
        <ChevronRight className="ms-auto size-4 rtl:rotate-180" aria-hidden="true" />
      </Link>
    </Card>
  );
}
