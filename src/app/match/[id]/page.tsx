import { notFound, redirect } from "next/navigation";

import { AppShell } from "@/components/footon/app-shell";
import { BackButton } from "@/components/footon/back-button";
import { CrowdPoll } from "@/components/footon/crowd-poll";
import { LiveMatch } from "@/components/footon/live-match";
import { MatchCentre, type MatchSection } from "@/components/footon/match-centre";
import { MatchFacts } from "@/components/footon/match-facts";
import { MatchInfo, MatchNews, TeamForm } from "@/components/footon/match-preview";
import { CompactScore, MatchScoreboard } from "@/components/footon/match-scoreboard";
import { MatchStats } from "@/components/footon/match-stats";
import { HeadToHead, MatchTable } from "@/components/footon/match-table";
import { PrematchCalls } from "@/components/footon/prematch-calls";
import { StreakFlame } from "@/components/footon/streak";
import { Card } from "@/components/ui/card";
import { HOT_STREAK, matches, prematchQuestions, type Match } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return matches.map((m) => ({ id: m.id }));
}

/** Your result on a finished match: points, streak, right vs wrong bars. */
function YourResult({ match: m }: { match: Match }) {
  const you = m.you;
  if (!you)
    return (
      <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">
        You didn&apos;t play this one. Calls open before every kickoff.
      </p>
    );
  return (
    <Card className="gap-4 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground">You scored</p>
          <p className="font-display text-[56px] leading-[0.95] font-bold text-primary">+{you.points}</p>
        </div>
        {you.streak >= HOT_STREAK && <StreakFlame count={you.streak} size="md" />}
      </div>
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

/**
 * Any match, in the FotMob match-page frame (scoreboard → sticky section tabs):
 *   live     → LiveMatch (your league's live match lives at /play)
 *   upcoming → Preview (your calls, who wins, match info, form, news) · Table · H2H
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
  const questions = prematchQuestions.map((q) => ({
    ...q,
    text: q.text.replace("{home}", m.home.name).replace("{away}", m.away.name),
  }));

  const preview = (
    <>
      <PrematchCalls questions={questions} made={m.you?.calls ?? 0} />
      {m.crowd && <CrowdPoll home={m.home} away={m.away} crowd={m.crowd} />}
      {m.preview ? (
        <>
          <MatchInfo match={m} preview={m.preview} />
          <TeamForm home={m.home} away={m.away} form={m.preview.form} />
          {m.preview.news && <MatchNews news={m.preview.news} />}
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">
          Team news and match info land here closer to kickoff.
        </p>
      )}
    </>
  );

  const sections: MatchSection[] = [
    ...(done
      ? [
          { value: "result", label: "Result", content: <YourResult match={m} /> },
          {
            value: "facts",
            label: "Facts",
            content: <MatchFacts events={m.events ?? []} minute={90} home={m.home.name} away={m.away.name} finished />,
          },
          ...(m.stats?.length ? [{ value: "stats", label: "Stats", content: <MatchStats stats={m.stats} home={m.home.name} away={m.away.name} /> }] : []),
        ]
      : [{ value: "preview", label: "Preview", content: preview }]),
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
