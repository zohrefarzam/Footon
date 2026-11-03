import { AppShell } from "@/components/footon/app-shell";
import { LiveMatch } from "@/components/footon/live-match";
import { chat, league, liveQuestion, matches } from "@/lib/mock-data";

/** Your league's live match: Predict first, then chat and the match facts. */
export default function PlayPage() {
  const m = matches.find((x) => x.status === "live" && x.league)!;

  return (
    <AppShell dock={false} className="gap-0 pt-0">
      <LiveMatch match={m} league={{ name: league.name, standings: league.standings, question: liveQuestion, chat }} />
    </AppShell>
  );
}
