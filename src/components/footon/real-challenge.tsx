"use client";

import { useSyncExternalStore } from "react";

import { AppShell } from "@/components/footon/app-shell";
import { BackButton } from "@/components/footon/back-button";
import { ChallengeGate } from "@/components/footon/challenge-gate";
import { ChallengeInvite } from "@/components/footon/challenge-invite";
import { LeagueChat } from "@/components/footon/league-chat";
import { MatchCentre, type MatchSection } from "@/components/footon/match-centre";
import { poolLine } from "@/components/footon/match-tables";
import { CompactScore, MatchScoreboard } from "@/components/footon/match-scoreboard";
import { RealPredict } from "@/components/footon/real-match";
import { Standings } from "@/components/footon/standings";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dateKey } from "@/lib/football/fixtures";
import { useProgress } from "@/lib/gamification/queries";
import { linkOf, toChallenge, useChallengeDetail, useChallengeMessages, useJoinChallenge, useSendMessage } from "@/lib/slips/challenges";
import { prematchChat } from "@/lib/mock-data";
import type { Card as ChallengeCard } from "@/lib/slips/challenges";
import { formatNumber, matchup } from "@/lib/format";

const noop = () => () => {};

/** The thread on the backend's messages; yours on the end side, in soft-lime. */
function RealChat({ card, closes }: { card: ChallengeCard; closes: string }) {
  const messages = useChallengeMessages(card.id);
  const send = useSendMessage(card.id);
  const me = useProgress().data?.userId;
  const members = card.members.map((p) => ({ name: p.name, initial: p.initial, you: p.userId === me }));
  const thread = (messages.data ?? []).map((m) => ({ from: m.user.name, initial: m.user.initial, text: m.text, you: m.user.userId === me }));
  return <LeagueChat chat={{ messages: thread, questions: [], reactions: prematchChat.reactions }} members={members} closes={closes} onSend={send} />;
}

/** One challenge on backend data: Predict (join first if invited) • Chat (once you're in) • League (table, invite link). */
export function RealChallenge({ id }: { id: string }) {
  const today = useSyncExternalStore(noop, () => dateKey(new Date()), () => null);
  const { data, isError } = useChallengeDetail(id);
  const join = useJoinChallenge();
  const balance = useProgress().data?.coins.free ?? 0;

  if (isError)
    return (
      <AppShell dock={false}>
        <BackButton href="/challenges" />
        <p className="text-center text-sm text-muted-foreground">این چالش را پیدا نکردیم یا الان نمی‌تونیم بیاریمش.</p>
      </AppShell>
    );
  if (!data || !today)
    return (
      <AppShell dock={false}>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </AppShell>
    );

  const c = toChallenge(data.card, today);
  const m = c.match;
  const inLeague = c.status === "joined" || c.status === "finished";
  const pool = poolLine(c.entry, c.members.length + (c.status === "invited" ? 1 : 0));

  const predict = <RealPredict m={m} />;
  const predictTab =
    c.status === "invited" && c.from ? (
      <ChallengeGate
        league={c.name}
        from={c.from}
        entry={c.entry}
        players={c.members.length}
        rules={c.rules}
        kickoff={m.kickoff}
        pool={pool}
        balance={balance}
        onAccept={() => join(c.id)}
      >
        {predict}
      </ChallengeGate>
    ) : c.status === "expired" ? (
      <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">این چالش بسته شد. چیزی ازت کم نشد.</p>
    ) : (
      predict
    );

  const table = data.standings.map((s) => ({ name: s.name, initial: s.initial, points: s.points, right: s.right, calls: s.calls, rank: s.rank, you: s.you }));
  const league = (
    <>
      {c.status === "joined" && (
        <ChallengeInvite name={c.name} link={linkOf(data.card)} code={data.card.inviteCode ?? ""} match={`${matchup(m.home.name, m.away.name)} • ${m.kickoff}`} />
      )}
      {table.length > 0 ? (
        <Standings rows={table} caption={`جدول ${c.name}`} />
      ) : (
        <Card className="overflow-hidden">
          <p className="px-4 py-3 text-sm text-muted-foreground">جدول با شروع بازی راه می‌افته. تا حالا {formatNumber(c.members.length)} نفر عضو شدن.</p>
        </Card>
      )}
      <p className="text-xs text-muted-foreground">
        ورودی نفری {formatNumber(c.entry)} • {pool}. برنده را امتیاز تعیین می‌کنه؛ مبلغ شرط هیچ‌وقت رتبه‌ات را عوض نمی‌کنه.
      </p>
    </>
  );

  const sections: MatchSection[] = [
    { value: "predict", label: "پیش‌بینی", content: predictTab },
    ...(inLeague ? [{ value: "chat", label: "چت", content: <RealChat card={data.card} closes={m.status === "upcoming" ? "شروع بازی" : "دقیقهٔ ۹۰"} /> }] : []),
    { value: "league", label: "لیگ", content: league },
  ];

  return (
    <AppShell dock={false} className="gap-0 pt-0">
      <MatchCentre
        back={<BackButton href="/challenges" />}
        title={c.name}
        compactScore={<CompactScore match={m} />}
        scoreboard={<MatchScoreboard match={m} />}
        sections={sections}
      />
    </AppShell>
  );
}
