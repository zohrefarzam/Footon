import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { BackButton } from "@/components/footon/back-button";
import { ChallengeGate } from "@/components/footon/challenge-gate";
import { CoinAmount } from "@/components/footon/coin";
import { LeagueBadge } from "@/components/footon/league-badge";
import { LeagueChat } from "@/components/footon/league-chat";
import { MatchCentre, type MatchSection } from "@/components/footon/match-centre";
import { MatchFacts } from "@/components/footon/match-facts";
import { MatchInfo, MatchNews, TeamForm } from "@/components/footon/match-preview";
import { CompactScore, MatchScoreboard } from "@/components/footon/match-scoreboard";
import { poolLine } from "@/components/footon/match-tables";
import { PredictionBuilder } from "@/components/footon/prediction-builder";
import { Standings } from "@/components/footon/standings";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardRow } from "@/components/ui/card";
import { challengesWithMatch } from "@/lib/challenges";
import { splitPool } from "@/lib/economy";
import { challenges, clubIds, people, predictionSlips, prematchChat, wallet, YOU_INITIAL } from "@/lib/mock-data";
import { kickoffISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

export function generateStaticParams() {
  return challenges.map((c) => ({ id: c.id }));
}

/**
 * One challenge, in the match-page frame (scoreboard → sticky section tabs):
 *   Predict (accept the invite here, then your predictions) • Chat • League • Match
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
      match={{ id: m.id, status: m.status, kickoff: m.kickoff, kickoffAt: kickoffISO(m), home: m.home.name, away: m.away.name, boost: !!m.boost }}
      teams={{ home: m.home, away: m.away }}
      initial={c.status === "invited" ? [] : predictionSlips[m.id]}
      rules={{ ...c.rules, league: c.name, setBy }}
      balance={wallet.coins - (c.status === "invited" ? c.entry : 0)}
    />
  );

  const predict =
    c.status === "expired" ? (
      <div className="bg-dots flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
        <Clock className="size-5 text-muted-foreground" aria-hidden="true" />
        <p className="text-[15px] font-semibold">این دعوت با شروع بازی منقضی شد</p>
        <p className="max-w-[30ch] text-sm text-muted-foreground">
          چالش {c.from?.name ?? "دوستت"} قبل از اینکه جواب بدی بسته شد. سکه‌ای ازت کم نشد.
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

  const members = c.members.map((x) => ({ name: people[x] ?? x, initial: x, you: x === YOU_INITIAL }));
  const league = (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4">
        <LeagueBadge name={c.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{c.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatNumber(members.length)} بازیکن • {c.mine ? "ساختهٔ تو" : c.from ? `ساختهٔ ${c.from.name}` : ""}
          </p>
        </div>
        <span className="text-end text-xs text-muted-foreground">
          صندوق
          <CoinAmount value={splitPool(c.entry, c.members.length).pool} className="block text-base" />
        </span>
      </div>
      {c.table?.length ? (
        <Standings rows={c.table} caption={`جدول ${c.name}`} className="mt-1" />
      ) : (
        <>
          <p className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">جدول با شروع بازی راه می‌افته</p>
          {members.map((p) => (
            <CardRow key={p.initial} className="py-3">
              <Avatar className="size-8">
                <AvatarFallback className={cn(p.you && "bg-primary text-primary-foreground")}>{p.initial}</AvatarFallback>
              </Avatar>
              <span className={cn("flex-1 text-[15px] font-semibold", p.you && "text-primary")}>{p.name}</span>
              {c.from?.initial === p.initial && <span className="text-xs text-muted-foreground">سازنده</span>}
              {c.mine && p.you && <span className="text-xs text-muted-foreground">سازنده</span>}
              <span className="font-display text-lg font-bold text-muted-foreground">{formatNumber(0)}</span>
            </CardRow>
          ))}
        </>
      )}
      {/* friends' clubs: open to look at, from the league */}
      {members.some((p) => clubIds[p.initial]) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5">
          <span className="text-xs text-muted-foreground">باشگاه‌ها</span>
          {members
            .filter((p) => clubIds[p.initial])
            .map((p) => (
              <Link
                key={p.initial}
                href={`/club/${clubIds[p.initial]}`}
                aria-label={`باشگاه ${p.name}`}
                className="flex h-11 items-center gap-0.5 rounded-md px-1 text-xs font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
              >
                {p.name}
                <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
              </Link>
            ))}
        </div>
      )}
      <p className="border-t border-line px-4 py-3 text-xs text-muted-foreground">
        ورودی نفری {formatNumber(c.entry)} • {pool}. برنده را امتیاز تعیین می‌کنه؛ مبلغ شرط هیچ‌وقت رتبه‌ات را عوض نمی‌کنه.
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
          اخبار تیم‌ها و اطلاعات بازی نزدیک شروع اینجا میاد.
        </p>
      )
    ) : (
      <MatchFacts events={m.events ?? []} minute={90} home={m.home.name} away={m.away.name} finished />
    );

  const inLeague = c.status === "joined" || c.status === "finished";
  const sections: MatchSection[] = [
    { value: "predict", label: "پیش‌بینی", content: predict },
    ...(inLeague
      ? [{ value: "chat", label: "چت", content: <LeagueChat chat={prematchChat} members={members} closes={m.status === "upcoming" ? "شروع بازی" : "دقیقهٔ ۹۰"} /> }]
      : []),
    { value: "league", label: "لیگ", content: league },
    { value: "match", label: "بازی", content: matchInfo },
  ];

  return (
    <AppShell dock={false} className="gap-0 pt-0">
      <MatchCentre
        back={<BackButton href="/challenges" />}
        title={`${c.name} • ${m.competition}`}
        compactScore={<CompactScore match={m} />}
        scoreboard={<MatchScoreboard match={m} />}
        sections={sections}
      />
    </AppShell>
  );
}
