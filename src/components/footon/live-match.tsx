import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HOT_STREAK, type Match } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { CrowdPoll } from "./crowd-poll";
import { LeagueChat, type ChatData } from "./league-chat";
import { LiveDot, LiveMinute } from "./live";
import { MatchCentre, type MatchSection } from "./match-centre";
import { MatchFacts } from "./match-facts";
import { MatchLineups } from "./match-lineups";
import { MatchStats } from "./match-stats";
import { HeadToHead, MatchTable } from "./match-table";
import { QuestionCard, type LiveQuestion } from "./question-card";
import { StreakFlame } from "./streak";
import { TeamCrest } from "./team-crest";

const ordinal = ["1st", "2nd", "3rd", "4th", "5th"];

type Standing = { name: string; initial: string; points: number; you?: boolean; delta?: number };
/** Your league on this match. Absent = a public match you can only watch and vote on. */
export type LiveLeague = { name: string; standings: Standing[]; question: LiveQuestion; chat: ChatData };

/**
 * A live match, laid out like a FotMob match page but played the Footon way:
 * scoreboard with scorers → sticky section tabs. Predict comes first because
 * calling the next moment is the point; the football facts sit one tap away.
 */
export function LiveMatch({ match: m, league, backHref = "/" }: { match: Match; league?: LiveLeague; backHref?: string }) {
  const [h, a] = m.score ?? [0, 0];
  const minute = m.minute ?? 0;
  const events = m.events ?? [];
  const goals = events.filter((e) => e.kind === "goal");
  const reds = events.filter((e) => e.kind === "red");
  const you = m.you;

  const scoreboard = (
    <section aria-label="Score" className="bg-dots -mx-5 flex flex-col gap-4 px-5 pt-3 pb-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        {(["home", "away"] as const).map((side, i) => {
          const t = m[side];
          return (
            <div key={side} className={cn("flex flex-col items-center gap-1.5 text-center", i === 1 && "col-start-3 row-start-1")}>
              <TeamCrest code={t.code} colors={t.colors} size="xl" />
              <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                {t.name}
                {reds
                  .filter((e) => e.side === side)
                  .map((e) => (
                    <span key={e.minute} role="img" aria-label="red card" className="h-3 w-2 rounded-[2px] bg-booking-red" />
                  ))}
              </span>
              <ul className="text-xs text-muted-foreground" aria-label={`${t.name} scorers`}>
                {goals
                  .filter((e) => e.side === side)
                  .map((e) => (
                    <li key={e.minute}>
                      {e.player} <span className="font-display">{e.minute}&apos;</span>
                    </li>
                  ))}
              </ul>
            </div>
          );
        })}
        <div className="col-start-2 row-start-1 flex flex-col items-center gap-1 pt-1">
          <p aria-live="polite" aria-label={`${m.home.name} ${h}, ${m.away.name} ${a}`} className="font-display text-[64px] leading-none font-bold">
            {h}
            <span className="mx-2.5 text-[#3f3f46]">:</span>
            {a}
          </p>
          <LiveMinute minute={minute} className="text-sm" />
        </div>
      </div>

      {/* match clock: the dot is now, ticks above/below are home/away goals */}
      <div
        className="relative mx-1 h-1 rounded-full bg-line"
        role="img"
        aria-label={`Minute ${minute} of 90${goals.length ? `. Goals at ${goals.map((e) => `${e.minute}'`).join(", ")}` : ""}`}
      >
        <div className="absolute inset-y-0 start-0 rounded-full bg-[#3f3f46]" style={{ width: `${(minute / 90) * 100}%` }} />
        <span className="absolute -top-[3px] start-1/2 h-2.5 w-px bg-[#52525b]" />
        {goals.map((e) => (
          <span
            key={e.minute}
            className={cn("absolute size-1.5 -translate-x-1/2 rounded-full bg-muted-foreground rtl:translate-x-1/2", e.side === "home" ? "-top-2.5" : "top-2")}
            style={{ insetInlineStart: `${(e.minute / 90) * 100}%` }}
          />
        ))}
        <span
          className="absolute -top-1 size-3 -translate-x-1/2 rounded-full border-[3px] border-background bg-foreground rtl:translate-x-1/2"
          style={{ insetInlineStart: `${(minute / 90) * 100}%` }}
        />
      </div>
    </section>
  );

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
      </Card>

      {m.crowd && <CrowdPoll home={m.home} away={m.away} crowd={m.crowd} />}
    </>
  ) : (
    <>
      {m.crowd && <CrowdPoll home={m.home} away={m.away} crowd={m.crowd} />}
      <Card variant="dashed" className="items-start gap-3 p-4">
        <div>
          <p className="text-[15px] font-semibold">Call the next moment with friends</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Start a league on this match and the live questions open here.</p>
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
    ...(m.lineups ? [{ value: "lineups", label: "Lineups", content: <MatchLineups home={m.home} away={m.away} lineups={m.lineups} /> }] : []),
    ...(m.table
      ? [{ value: "table", label: "Table", content: <MatchTable rows={m.table} playing={[m.home.code, m.away.code]} competition={m.competition} /> }]
      : []),
    ...(m.h2h ? [{ value: "h2h", label: "H2H", content: <HeadToHead h2h={m.h2h} home={m.home.name} away={m.away.name} /> }] : []),
  ];

  return (
    <MatchCentre
      back={
        <Button asChild variant="secondary" size="icon-sm" aria-label="Back" className="rounded-[11px]">
          <Link href={backHref}>
            <ChevronLeft className="rtl:rotate-180" />
          </Link>
        </Button>
      }
      title={league ? `${league.name} · ${m.competition}` : m.competition}
      compactScore={
        <span className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="text-muted-foreground">{m.home.code}</span>
          {h}
          <span className="text-[#3f3f46]">:</span>
          {a}
          <span className="text-muted-foreground">{m.away.code}</span>
          <LiveMinute minute={minute} className="ms-auto" />
        </span>
      }
      scoreboard={scoreboard}
      sections={sections}
    />
  );
}
