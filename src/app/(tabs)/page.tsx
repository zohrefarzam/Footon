import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { InviteStrip } from "@/components/footon/invite-strip";
import { MatchList } from "@/components/footon/match-list";
import { ProgressRing } from "@/components/footon/progress-ring";
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

      <Link
        href="/team"
        className="flex items-center gap-3.5 rounded-xl border border-dashed border-line-strong py-3 pr-4 pl-3 transition-colors hover:bg-[#141417]"
      >
        <ProgressRing value={fantasyProgress.done} max={fantasyProgress.total} />
        <div className="flex-1">
          <p className="text-[15px] font-semibold">Fantasy unlocks soon</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {fantasyProgress.total - fantasyProgress.done} more predictions to build your squad
          </p>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>
    </AppShell>
  );
}
