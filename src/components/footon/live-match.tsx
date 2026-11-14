import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ComboMeter } from "./gamification/combo-meter";
import { LockedFeatureGate } from "./gamification/locked-feature-gate";
import { ENTRY_TIERS, splitPool } from "@/lib/economy";
import { kickoffISO } from "@/lib/dates";
import type { Match, Standing } from "@/lib/mock-data";
import { cn, ordinal } from "@/lib/utils";
import { BackButton } from "./back-button";
import { CrowdPoll } from "./crowd-poll";
import { LeagueChat, type ChatData } from "./league-chat";
import { CoinAmount } from "./coin";
import { LiveDot } from "./live";
import { MatchCentre, type MatchSection } from "./match-centre";
import { MatchFacts } from "./match-facts";
import { CompactScore, MatchScoreboard } from "./match-scoreboard";
import { MatchLineups } from "./match-lineups";
import { MatchStats } from "./match-stats";
import { poolLine } from "./match-tables";
import { HeadToHead, MatchTable } from "./match-table";
import { QuestionCard, type LiveQuestion } from "./question-card";
import { Standings } from "./standings";
import { formatNumber, formatSigned } from "@/lib/format";


/** Your league on this match. Absent = a public match you can only watch and vote on. */
export type LiveLeague = {
  name: string;
  standings: Standing[];
  question: LiveQuestion;
  chat: ChatData;
  /** The league's coin pool on this match. Points decide who takes it. */
  pool?: { entry: number; players: number };
};

/**
 * A live match, laid out like a FotMob match page but played the Lucky Fan way:
 * scoreboard with scorers → sticky section tabs. Predict comes first because
 * calling the next moment is the point; the football facts sit one tap away.
 */
export function LiveMatch({ match: m, league, backHref = "/" }: { match: Match; league?: LiveLeague; backHref?: string }) {
  const minute = m.minute ?? 0;
  const events = m.events ?? [];
  const you = m.you;

  const predict = league ? (
    <>
      <QuestionCard question={league.question} reward={{ matchId: m.id, questionId: `q${league.question.index}`, kickoffAt: kickoffISO(m) }} />
      <ComboMeter />

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
          <span className="text-[13px] font-medium text-muted-foreground">{league.name}</span>
          {m.progress && (
            <span className="text-xs text-muted-foreground">
              <span className="font-display text-sm font-bold text-foreground">{formatNumber(m.progress.asked)}</span> از {formatNumber(m.progress.total)} سؤال پرسیده شده
            </span>
          )}
        </div>
        <ol className="grid grid-cols-3 gap-2 px-3 pb-3" aria-label="جدول لیگ">
          {league.standings.map((p, i) => (
            <li
              key={p.name}
              className={cn("relative rounded-[12px] border px-2.5 py-2", p.you ? "border-primary-line bg-primary-soft" : "border-line bg-surface-2")}
            >
              <div className={cn("flex justify-between text-[11px]", p.you ? "font-semibold text-primary" : "text-muted-foreground")}>
                <span>
                  {ordinal(i + 1)} • {p.name}
                </span>
                {p.delta ? (
                  <span aria-label={`${formatNumber(Math.abs(p.delta))} پله ${p.delta > 0 ? "بالا" : "پایین"}`}>
                    {p.delta > 0 ? "▲" : "▼"}
                    {formatNumber(Math.abs(p.delta))}
                  </span>
                ) : null}
              </div>
              <div className={cn("mt-0.5 font-display text-[22px] font-bold", !p.you && "text-silver")}>{formatNumber(p.points)}</div>
            </li>
          ))}
        </ol>
        {you && (
          <div className="flex items-center gap-3 border-t border-line px-4 py-3">
            <p className="flex-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {formatNumber(you.right)} از {formatNumber(you.calls)}
              </span>{" "}
              پیش‌بینی درست امشب
            </p>
            <span className="font-display text-lg font-bold text-primary">{formatSigned(you.points)}</span>
          </div>
        )}
        {league.pool && (
          <div className="flex items-center gap-3 border-t border-line px-4 py-3">
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              صندوق • نفری {formatNumber(league.pool.entry)} • {poolLine(league.pool.entry, league.pool.players)}
            </p>
            <CoinAmount value={splitPool(league.pool.entry, league.pool.players).pool} className="text-base" />
          </div>
        )}
      </Card>

      {m.crowd && <CrowdPoll home={m.home} away={m.away} crowd={m.crowd} />}
    </>
  ) : (
    <>
      {m.crowd && <CrowdPoll home={m.home} away={m.away} crowd={m.crowd} />}
      <Card variant="dashed" className="items-start gap-3 p-4">
        <div>
          <p className="text-[15px] font-semibold">لحظهٔ بعدی را با دوستانت پیش‌بینی کن</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            روی این بازی یه لیگ بساز تا سؤال‌های زنده اینجا باز بشن. ورودی از {formatNumber(ENTRY_TIERS[0])}، صندوق هم به بهترین پیش‌بینی‌کننده می‌رسه.
          </p>
        </div>
        <LockedFeatureGate feature="createLeague" variant="button" title="ساختن لیگ" className="w-full">
          <Button asChild size="lg" className="w-full">
            <Link href="/challenges/new">
              یک لیگ بساز
              <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
            </Link>
          </Button>
        </LockedFeatureGate>
      </Card>
    </>
  );

  const sections: MatchSection[] = [
    { value: "predict", label: "پیش‌بینی", badge: league ? <LiveDot className="size-1.5" /> : undefined, content: predict },
    ...(league
      ? [
          { value: "chat", label: "چت", content: <LeagueChat chat={league.chat} members={league.standings} /> },
          {
            value: "league",
            label: "لیگ",
            content: (
              <Card className="overflow-hidden pb-1">
                <Standings rows={league.standings} caption={`جدول ${league.name}`} />
                <p className="border-t border-line px-4 py-3 text-xs text-muted-foreground">برنده را امتیاز پیش‌بینی‌های درست تعیین می‌کنه. مبلغ شرط هیچ‌وقت رتبه‌ات را عوض نمی‌کنه.</p>
              </Card>
            ),
          },
        ]
      : []),
    {
      value: "facts",
      label: "رویدادها",
      content: <MatchFacts events={events} minute={minute} home={m.home.name} away={m.away.name} />,
    },
    ...(m.stats?.length ? [{ value: "stats", label: "آمار", content: <MatchStats stats={m.stats} home={m.home.name} away={m.away.name} /> }] : []),
    ...(m.lineups ? [{ value: "lineups", label: "ترکیب", content: <MatchLineups home={m.home} away={m.away} lineups={m.lineups} events={events} /> }] : []),
    ...(m.table
      ? [{ value: "table", label: "جدول", content: <MatchTable rows={m.table} playing={[m.home.code, m.away.code]} competition={m.competition} /> }]
      : []),
    ...(m.h2h ? [{ value: "h2h", label: "رودررو", content: <HeadToHead h2h={m.h2h} home={m.home.name} away={m.away.name} /> }] : []),
  ];

  return (
    <MatchCentre
      back={<BackButton href={backHref} />}
      title={league ? `${league.name} • ${m.competition}` : m.competition}
      compactScore={<CompactScore match={m} />}
      scoreboard={<MatchScoreboard match={m} />}
      sections={sections}
    />
  );
}
