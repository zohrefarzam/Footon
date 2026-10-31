import { AppShell } from "@/components/footon/app-shell";
import { InviteStrip } from "@/components/footon/invite-strip";
import { MatchList } from "@/components/footon/match-list";
import { FantasyUnlock } from "@/components/footon/fantasy-unlock";
import { fantasyProgress, invites, matches } from "@/lib/mock-data";

export default function HomePage() {
  const pending = invites.flatMap((i) => {
    const match = matches.find((m) => m.id === i.matchId);
    return match ? [{ ...i, match }] : [];
  });

  return (
    <AppShell>
      <h1 className="text-[26px] font-bold tracking-[-0.03em]">Your matches</h1>

      <InviteStrip invites={pending} />

      <MatchList matches={matches} liveHref="/play" />

      <FantasyUnlock done={fantasyProgress.done} total={fantasyProgress.total} />
    </AppShell>
  );
}
