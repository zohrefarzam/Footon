import { notFound, redirect } from "next/navigation";
import { Clock } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { BackButton } from "@/components/footon/back-button";
import { ChallengeGate } from "@/components/footon/challenge-gate";
import { CoinAmount } from "@/components/footon/coin";
import { LeagueChat } from "@/components/footon/league-chat";
import { MatchCentre, type MatchSection } from "@/components/footon/match-centre";
import { MatchFacts } from "@/components/footon/match-facts";
import { MatchInfo, MatchNews, TeamForm } from "@/components/footon/match-preview";
import { CompactScore, MatchScoreboard } from "@/components/footon/match-scoreboard";
import { poolLine } from "@/components/footon/match-tables";
import { PredictionBuilder } from "@/components/footon/prediction-builder";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardRow } from "@/components/ui/card";
import { challengesWithMatch } from "@/lib/challenges";
import { splitPool } from "@/lib/economy";
import { challenges, people, predictionSlips, prematchChat, wallet } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return challenges.map((c) => ({ id: c.id }));
}

/**
 * One challenge, in the match-page frame (scoreboard → sticky section tabs):
 *   Predict (accept the invite here, then your predictions) · Chat · League · Match
 * Your league's live match plays at /play. Expired invites read back only.
 */
export default async function ChallengePage({ params }: PageProps<"/challenges/[id]">) {
  const { id } = await params;
  const c = challengesWithMatch().find((x) => x.id === id);
  if (!c) notFound();
  const m = c.match;
  if (c.status === "joined" && m.status === "live") redirect("/play");

  const setBy = c.mine ? undefined : c.from?.name;
  const pool = poolLine(c.entry, c.members.length + (c.status === "invited" ? 1 : 0));
  const builder = (
    <PredictionBuilder
      match={{ id: m.id, status: m.status, kickoff: m.kickoff, home: m.home.name, away: m.away.name, boost: !!m.boost }}
      initial={c.status === "invited" ? [] : predictionSlips[m.id]}
      rules={{ ...c.rules, league: c.name, setBy }}
      balance={wallet.coins - (c.status === "invited" ? c.entry : 0)}
    />
  );

  const predict =
    c.status === "expired" ? (
      <div className="bg-dots flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
        <Clock className="size-5 text-muted-foreground" aria-hidden="true" />
        <p className="text-[15px] font-semibold">This invite expired at kickoff</p>
        <p className="max-w-[30ch] text-sm text-muted-foreground">
          {c.from?.name ?? "Your friend"}&apos;s challenge closed before you answered. Nothing was charged.
        </p>
      </div>
    ) : c.status === "invited" && c.from ? (
      <ChallengeGate
        league={c.name}
        from={c.from}
        entry={c.entry}
        players={c.members.length}
        rules={c.rules}
        kickoff={m.kickoff}
        pool={pool}
        balance={wallet.coins}
      >
        {builder}
      </ChallengeGate>
    ) : (
      builder
    );

  const members = c.members.map((x) => ({ name: people[x] ?? x, initial: x, you: x === "Y" }));
  const league = (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
        <span className="text-[13px] font-medium text-muted-foreground">Players</span>
        <span className="text-xs text-muted-foreground">
          Pool <CoinAmount value={splitPool(c.entry, c.members.length).pool} className="text-sm" />
        </span>
      </div>
      {members.map((p) => (
        <CardRow key={p.initial} className="py-3">
          <Avatar className="size-8">
            <AvatarFallback className={cn(p.you && "bg-primary text-primary-foreground")}>{p.initial}</AvatarFallback>
          </Avatar>
          <span className={cn("flex-1 text-[15px] font-semibold", p.you && "text-primary")}>{p.name}</span>
          {c.from?.initial === p.initial && <span className="text-xs text-muted-foreground">created it</span>}
          {c.mine && p.you && <span className="text-xs text-muted-foreground">created it</span>}
        </CardRow>
      ))}
      <p className="border-t border-line px-4 py-3 text-xs text-muted-foreground">
        {c.entry.toLocaleString("en-US")} entry each · {pool}. Points decide it; stakes never change your rank.
      </p>
    </Card>
  );

  const matchInfo =
    m.status === "upcoming" ? (
      m.preview ? (
        <>
          <MatchInfo match={m} preview={m.preview} />
          <TeamForm home={m.home} away={m.away} form={m.preview.form} />
          {m.preview.news && <MatchNews news={m.preview.news} />}
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">
          Team news and match info land here closer to kickoff.
        </p>
      )
    ) : (
      <MatchFacts events={m.events ?? []} minute={90} home={m.home.name} away={m.away.name} finished />
    );

  const inLeague = c.status === "joined" || c.status === "finished";
  const sections: MatchSection[] = [
    { value: "predict", label: "Predict", content: predict },
    ...(inLeague
      ? [{ value: "chat", label: "Chat", content: <LeagueChat chat={prematchChat} members={members} closes={m.status === "upcoming" ? "kickoff" : "90'"} /> }]
      : []),
    { value: "league", label: "League", content: league },
    { value: "match", label: "Match", content: matchInfo },
  ];

  return (
    <AppShell dock={false} className="gap-0 pt-0">
      <MatchCentre
        back={<BackButton href="/challenges" />}
        title={`${c.name} · ${m.competition}`}
        compactScore={<CompactScore match={m} />}
        scoreboard={<MatchScoreboard match={m} />}
        sections={sections}
      />
    </AppShell>
  );
}
