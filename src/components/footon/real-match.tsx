"use client";

import { PageLoader } from "./page-loader";
import { useSyncExternalStore } from "react";

import { AppShell } from "@/components/footon/app-shell";
import { BackButton } from "@/components/footon/back-button";
import { CrowdPoll } from "@/components/footon/crowd-poll";
import { MatchCentre, type MatchSection } from "@/components/footon/match-centre";
import { MatchFacts } from "@/components/footon/match-facts";
import { MatchLineups } from "@/components/footon/match-lineups";
import { MatchInfo, TeamForm } from "@/components/footon/match-preview";
import { CompactScore, MatchScoreboard } from "@/components/footon/match-scoreboard";
import { RealLiveQuestion } from "@/components/footon/real-live-question";
import { ChallengeCta } from "@/components/footon/challenge-cta";
import { PredictionBuilder } from "@/components/footon/prediction-builder";
import { MatchStats } from "@/components/footon/match-stats";
import { HeadToHead, MatchTable } from "@/components/footon/match-table";
import { Skeleton } from "@/components/ui/skeleton";
import { dateKey } from "@/lib/football/fixtures";
import { toMatchPage } from "@/lib/football/match";
import { useMatchBundle } from "@/lib/football/queries";
import { useProgress } from "@/lib/gamification/queries";
import Link from "next/link";
import { useChallenges } from "@/lib/slips/challenges";
import { useCrowd, useIsBig, useSaveSlip, useSlip, useVote } from "@/lib/slips/api";
import type { Match } from "@/lib/mock-data";

const noop = () => () => {};

/** Your slip and the crowd poll for one match. The slip loads first, so the builder starts from what you saved. */
export function RealPredict({ m }: { m: Match }) {
  const slip = useSlip(m.id);
  const crowd = useCrowd(m.id);
  const save = useSaveSlip(m.id);
  const vote = useVote(m.id);
  const big = useIsBig(m.id).data;
  const balance = useProgress().data?.coins.free ?? 0;
  // you made a challenge on this match: your calls go there, not in a separate slip
  const mine = useChallenges(m.today ?? null).all.find((c) => c.matchId === m.id && c.mine && c.status === "joined");

  if (slip.isPending && m.status !== "live") return <PageLoader />;
  const open = m.status === "upcoming" && (slip.data?.editable ?? true);
  const myPick = crowd.data?.myPick ? (crowd.data.myPick.toLowerCase() as "home" | "draw" | "away") : null;
  return (
    <>
      {m.status === "live" && m.kickoffAt && <RealLiveQuestion matchId={m.id} kickoffAt={m.kickoffAt} />}
      {mine && m.status === "upcoming" && (
        <p className="rounded-xl border border-dashed border-line-strong px-4 py-4 text-sm text-muted-foreground">
          روی این بازی چالش «{mine.name}» رو ساختی، پس پیش‌بینی جدا نمیشه.{" "}
          <Link href={`/challenges/${mine.id}`} className="font-semibold text-foreground underline underline-offset-4">
            پیش‌بینی‌هات رو تو چالش ثبت کن
          </Link>
        </p>
      )}
      {!(mine && m.status === "upcoming") && (open || slip.data?.picks.length) && (
        <PredictionBuilder
          match={{ id: m.id, status: open ? "upcoming" : m.status === "live" ? "live" : "finished", kickoff: m.kickoff, kickoffAt: m.kickoffAt, home: m.home.name, away: m.away.name }}
          teams={{ home: m.home, away: m.away }}
          initial={slip.data?.picks}
          balance={balance}
          onLock={save}
        />
      )}
      {big && m.status === "upcoming" && !mine && <ChallengeCta matchId={m.id} />}
      {crowd.data && <CrowdPoll key={myPick ?? "none"} home={m.home} away={m.away} crowd={crowd.data} myPick={myPick} onVote={vote} />}
    </>
  );
}

/** A match on backend data: scoreboard and the sections the backend can fill (facts, stats, line-ups, table, head to head, form). Predict is your slip and the crowd poll. */
export function RealMatch({ id }: { id: string }) {
  const today = useSyncExternalStore(noop, () => dateKey(new Date()), () => null);
  const { data, isError } = useMatchBundle(id);

  if (isError)
    return (
      <AppShell dock={false}>
        <BackButton />
        <p className="text-center text-sm text-muted-foreground">این بازی را پیدا نکردیم یا الان نمی‌تونیم بیاریمش.</p>
      </AppShell>
    );
  if (!data || !today)
    return (
      <AppShell dock={false}>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </AppShell>
    );

  const m = toMatchPage(data, today);
  const sections: MatchSection[] = [
    { value: "predict", label: "پیش‌بینی", content: <RealPredict m={m} /> },
    ...(m.events?.length || m.status !== "upcoming"
      ? [{ value: "facts", label: "رویدادها", content: <MatchFacts events={m.events ?? []} minute={m.minute ?? 90} home={m.home.name} away={m.away.name} finished={m.status === "finished"} /> }]
      : []),
    ...(m.stats ? [{ value: "stats", label: "آمار", content: <MatchStats stats={m.stats} home={m.home.name} away={m.away.name} /> }] : []),
    ...(m.lineups ? [{ value: "lineups", label: "ترکیب", content: <MatchLineups home={m.home} away={m.away} lineups={m.lineups} events={m.events} /> }] : []),
    ...(m.preview
      ? [
          {
            value: "preview",
            label: "پیش از بازی",
            content: (
              <>
                {m.preview.venue.name && <MatchInfo match={m} preview={m.preview} />}
                {(m.preview.form.home.length > 0 || m.preview.form.away.length > 0) && <TeamForm home={m.home} away={m.away} form={m.preview.form} />}
              </>
            ),
          },
        ]
      : []),
    ...(m.table?.length ? [{ value: "table", label: "جدول", content: <MatchTable rows={m.table} playing={[m.home.code, m.away.code]} competition={m.competition} /> }] : []),
    ...(m.h2h ? [{ value: "h2h", label: "رودررو", content: <HeadToHead h2h={m.h2h} home={m.home.name} away={m.away.name} /> }] : []),
  ];

  return (
    <AppShell dock={false} className="gap-0 pt-0">
      <MatchCentre back={<BackButton />} title={m.competition} compactScore={<CompactScore match={m} />} scoreboard={<MatchScoreboard match={m} />} sections={sections} />
    </AppShell>
  );
}
