import { notFound, redirect } from "next/navigation";
import { Trophy } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { BackButton } from "@/components/footon/back-button";
import { CrowdPoll } from "@/components/footon/crowd-poll";
import { LiveMatch } from "@/components/footon/live-match";
import { MatchCentre, type MatchSection } from "@/components/footon/match-centre";
import { MatchFacts } from "@/components/footon/match-facts";
import { MatchInfo, MatchNews, TeamForm } from "@/components/footon/match-preview";
import { CompactScore, MatchScoreboard } from "@/components/footon/match-scoreboard";
import { MatchStats } from "@/components/footon/match-stats";
import { MatchTables } from "@/components/footon/match-tables";
import { HeadToHead, MatchTable } from "@/components/footon/match-table";
import { PredictionBuilder } from "@/components/footon/prediction-builder";
import { CoinAmount } from "@/components/footon/coin";
import { NumberTicker } from "@/components/footon/number-ticker";
import { PitchMarkings } from "@/components/footon/pitch-markings";
import { StreakFlame } from "@/components/footon/streak";
import { Card } from "@/components/ui/card";
import { challenges, HOT_STREAK, matches, predictionSlips, wallet, type Match } from "@/lib/mock-data";
import { cn, ordinal } from "@/lib/utils";

export function generateStaticParams() {
  return matches.map((m) => ({ id: m.id }));
}

/** Your result on a finished match: points, streak, right vs wrong bars, and your place in the league it counted for. */
function YourResult({ match: m, league }: { match: Match; league?: { name: string; rank?: number; players: number } }) {
  const you = m.you;
  if (!you)
    return (
      <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">
        You didn&apos;t play this one. Calls open before every kickoff.
      </p>
    );
  const won = league?.rank === 1;
  return (
    <Card className="floodlight relative isolate gap-4 overflow-hidden border-line-strong p-4">
      <PitchMarkings variant="box" corners className="-z-10" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">You scored</p>
          <p className="font-display text-[56px] leading-[0.95] font-bold text-primary">
            <NumberTicker value={you.points} prefix="+" />
            <span className="ms-1.5 text-2xl text-muted-foreground">pts</span>
          </p>
        </div>
        {you.streak >= HOT_STREAK && <StreakFlame count={you.streak} size="md" />}
      </div>
      {league?.rank && (
        <p
          className={cn(
            "flex items-center gap-3 rounded-lg border px-3 py-2.5",
            won ? "border-gold-line bg-gold-soft" : "border-line bg-surface-2",
          )}
        >
          <span
            aria-hidden="true"
            className={cn("flex size-9 items-center justify-center rounded-full", won ? "bg-gold text-gold-foreground" : "bg-surface-3 text-foreground")}
          >
            <Trophy className="size-[18px]" strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1 text-sm">
            <span className={cn("font-semibold", won && "text-gold")}>{won ? `You won ${league.name}` : `${ordinal(league.rank)} in ${league.name}`}</span>
            <span className="block text-xs text-muted-foreground">
              {ordinal(league.rank)} of {league.players} · final table
            </span>
          </span>
        </p>
      )}
      <div className="flex gap-1.5" role="img" aria-label={`${you.right} of ${you.calls} calls right`}>
        {Array.from({ length: you.calls }, (_, i) => (
          <span key={i} className={cn("h-2 flex-1 rounded-full", i < you.right ? "bg-win" : "h-1 self-center bg-loss")} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {you.right} of {you.calls}
        </span>{" "}
        calls right{you.streak >= HOT_STREAK ? `, ${you.streak} in a row to finish.` : "."}
      </p>
    </Card>
  );
}

/** Coins this match moved, each with its reason. Kept apart from points: they never mix. */
function YourCoins({ match: m }: { match: Match }) {
  const rows = m.settlement;
  if (!rows?.length) return null;
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return (
    <section aria-labelledby="coins-title" className="flex flex-col gap-2.5">
      <h2 id="coins-title" className="flex items-baseline justify-between text-[13px] font-medium text-muted-foreground">
        Coins from this match
        <CoinAmount value={total} signed className="text-[15px]" />
      </h2>
      <Card className="overflow-hidden">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3 [&+&]:border-t [&+&]:border-line">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold">{r.label}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.reason}</p>
            </div>
            <CoinAmount value={r.amount} signed className="text-base" />
          </div>
        ))}
      </Card>
    </section>
  );
}

/**
 * Any match, in the FotMob match-page frame (scoreboard → sticky section tabs):
 *   live     → LiveMatch (your league's live match lives at /play)
 *   upcoming → Predict (your predictions, the two tables, who wins) · Preview (info, form, news) · Table · H2H
 *   finished → Result · Facts · Stats · Table · H2H
 */
export default async function MatchPage({ params }: PageProps<"/match/[id]">) {
  const { id } = await params;
  const m = matches.find((x) => x.id === id);
  if (!m) notFound();
  if (m.status === "live") {
    if (m.league) redirect("/play");
    return (
      <AppShell dock={false} className="gap-0 pt-0">
        <LiveMatch match={m} backHref="/live" />
      </AppShell>
    );
  }

  const done = m.status === "finished";
  const pool = challenges.find((c) => c.matchId === m.id && c.status === "joined");
  const settled = challenges.find((c) => c.matchId === m.id && c.status === "finished");

  const builder = (
    <PredictionBuilder
      match={{ id: m.id, status: m.status, kickoff: m.kickoff, home: m.home.name, away: m.away.name, boost: !!m.boost }}
      teams={{ home: m.home, away: m.away }}
      initial={predictionSlips[m.id]}
      rules={pool && { ...pool.rules, league: pool.name, setBy: pool.mine ? undefined : pool.from?.name }}
      balance={wallet.coins}
    />
  );

  const predict = (
    <>
      {builder}
      <MatchTables
        joinedFree={!!m.you?.calls || !!predictionSlips[m.id]?.length}
        coin={pool && { league: pool.name, entry: pool.entry, players: pool.members.length, href: `/challenges/${pool.id}` }}
      />
      {m.crowd && <CrowdPoll home={m.home} away={m.away} crowd={m.crowd} />}
    </>
  );

  const preview = m.preview ? (
    <>
      <MatchInfo match={m} preview={m.preview} />
      <TeamForm home={m.home} away={m.away} form={m.preview.form} />
      {m.preview.news && <MatchNews news={m.preview.news} />}
    </>
  ) : (
    <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">
      Team news and match info land here closer to kickoff.
    </p>
  );

  const sections: MatchSection[] = [
    ...(done
      ? [
          {
            value: "result",
            label: "Result",
            content: (
              <>
                <YourResult match={m} league={settled && { name: settled.name, rank: settled.rank, players: settled.members.length }} />
                {predictionSlips[m.id]?.length ? builder : null}
                <YourCoins match={m} />
              </>
            ),
          },
          {
            value: "facts",
            label: "Facts",
            content: <MatchFacts events={m.events ?? []} minute={90} home={m.home.name} away={m.away.name} finished />,
          },
          ...(m.stats?.length ? [{ value: "stats", label: "Stats", content: <MatchStats stats={m.stats} home={m.home.name} away={m.away.name} /> }] : []),
        ]
      : [
          { value: "predict", label: "Predict", content: predict },
          { value: "preview", label: "Preview", content: preview },
        ]),
    ...(m.table
      ? [{ value: "table", label: "Table", content: <MatchTable rows={m.table} playing={[m.home.code, m.away.code]} competition={m.competition} /> }]
      : []),
    ...(m.h2h ? [{ value: "h2h", label: "H2H", content: <HeadToHead h2h={m.h2h} home={m.home.name} away={m.away.name} /> }] : []),
  ];

  return (
    <AppShell dock={false} className="gap-0 pt-0">
      <MatchCentre
        back={<BackButton />}
        title={m.league ? `${m.league} · ${m.competition}` : m.competition}
        compactScore={<CompactScore match={m} />}
        scoreboard={<MatchScoreboard match={m} />}
        sections={sections}
      />
    </AppShell>
  );
}
