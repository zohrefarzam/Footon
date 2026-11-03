import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ENTRY_TIERS, splitPool } from "@/lib/economy";
import { HOT_STREAK, type Match } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
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
import { StreakFlame } from "./streak";

const ordinal = ["1st", "2nd", "3rd", "4th", "5th"];

type Standing = { name: string; initial: string; points: number; you?: boolean; delta?: number };
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
 * A live match, laid out like a FotMob match page but played the Footon way:
 * scoreboard with scorers → sticky section tabs. Predict comes first because
 * calling the next moment is the point; the football facts sit one tap away.
 */
export function LiveMatch({ match: m, league, backHref = "/" }: { match: Match; league?: LiveLeague; backHref?: string }) {
  const minute = m.minute ?? 0;
  const events = m.events ?? [];
  const you = m.you;

  const predict = league ? (
    <>
      <QuestionCard question={league.question} />

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
          <span className="text-[13px] font-medium text-muted-foreground">{league.name}</span>
          {m.progress && (
            <span className="text-xs text-muted-foreground">
              <span className="font-display text-sm font-bold text-foreground">{m.progress.asked}</span> of {m.progress.total} asked
            </span>
          )}
        </div>
        <ol className="grid grid-cols-3 gap-2 px-3 pb-3" aria-label="League standings">
          {league.standings.map((p, i) => (
            <li
              key={p.name}
              className={cn("rounded-[12px] border px-2.5 py-2", p.you ? "border-primary-line bg-primary-soft" : "border-line bg-surface-2")}
            >
              <div className={cn("flex justify-between text-[11px]", p.you ? "font-semibold text-primary" : "text-muted-foreground")}>
                <span>
                  {ordinal[i]} · {p.name}
                </span>
                {p.delta ? <span aria-label={`up ${p.delta}`}>▲{p.delta}</span> : null}
              </div>
              <div className={cn("mt-0.5 font-display text-[22px] font-bold", !p.you && "text-[#d4d4d8]")}>{p.points}</div>
            </li>
          ))}
        </ol>
        {you && (
          <div className="flex items-center gap-3 border-t border-line px-4 py-3">
            <p className="flex-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {you.right} of {you.calls}
              </span>{" "}
              calls right tonight
            </p>
            {you.streak >= HOT_STREAK && <StreakFlame count={you.streak} />}
            <span className="font-display text-lg font-bold text-primary">+{you.points}</span>
          </div>
        )}
        {league.pool && (
          <div className="flex items-center gap-3 border-t border-line px-4 py-3">
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              Pool · {league.pool.entry.toLocaleString("en-US")} each · {poolLine(league.pool.entry, league.pool.players)}
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
          <p className="text-[15px] font-semibold">Call the next moment with friends</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Start a league on this match and the live questions open here. Entry from {ENTRY_TIERS[0].toLocaleString("en-US")}, the pool goes to the top caller.
          </p>
        </div>
        <Button asChild size="lg" className="w-full">
          <Link href="/challenges/new">
            Start a league
            <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
          </Link>
        </Button>
      </Card>
    </>
  );

  const sections: MatchSection[] = [
    { value: "predict", label: "Predict", badge: league ? <LiveDot className="size-1.5" /> : undefined, content: predict },
    ...(league ? [{ value: "chat", label: "Chat", content: <LeagueChat chat={league.chat} members={league.standings} /> }] : []),
    {
      value: "facts",
      label: "Facts",
      content: <MatchFacts events={events} minute={minute} home={m.home.name} away={m.away.name} />,
    },
    ...(m.stats?.length ? [{ value: "stats", label: "Stats", content: <MatchStats stats={m.stats} home={m.home.name} away={m.away.name} /> }] : []),
    ...(m.lineups ? [{ value: "lineups", label: "Lineups", content: <MatchLineups home={m.home} away={m.away} lineups={m.lineups} events={events} /> }] : []),
    ...(m.table
      ? [{ value: "table", label: "Table", content: <MatchTable rows={m.table} playing={[m.home.code, m.away.code]} competition={m.competition} /> }]
      : []),
    ...(m.h2h ? [{ value: "h2h", label: "H2H", content: <HeadToHead h2h={m.h2h} home={m.home.name} away={m.away.name} /> }] : []),
  ];

  return (
    <MatchCentre
      back={<BackButton href={backHref} />}
      title={league ? `${league.name} · ${m.competition}` : m.competition}
      compactScore={<CompactScore match={m} />}
      scoreboard={<MatchScoreboard match={m} />}
      sections={sections}
    />
  );
}
