import { AppShell } from "@/components/footon/app-shell";
import { FantasyUnlock } from "@/components/footon/fantasy-unlock";
import { InviteTile } from "@/components/footon/invite-tile";
import { MatchList } from "@/components/footon/match-list";
import { fantasyProgress, invites, matches } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <AppShell>
      <h1 className="text-[26px] font-bold tracking-[-0.03em]">Your matches</h1>

      {/* compact tiles so the match list gets the screen */}
      <div className="flex gap-2.5">
        {invites.length > 0 && <InviteTile invites={invites} className="flex-1" />}
        <FantasyUnlock done={fantasyProgress.done} total={fantasyProgress.total} className="flex-[1.4]" />
      </div>

      <MatchList matches={matches} liveHref="/play" />
    </AppShell>
  );
}
