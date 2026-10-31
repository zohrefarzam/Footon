import Link from "next/link";
import { ChevronRight, X } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { MatchFilter } from "@/components/footon/match-filter";
import { MatchRow } from "@/components/footon/match-row";
import { ProgressRing } from "@/components/footon/progress-ring";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fantasyProgress, invite, matches } from "@/lib/mock-data";

export default function HomePage() {
  const live = matches.find((m) => m.status === "live")!;

  return (
    <AppShell>
      <header>
        <p className="text-[13px] text-muted-foreground">Good evening</p>
        <h1 className="mt-0.5 text-[26px] font-bold tracking-[-0.03em]">Your matches</h1>
      </header>

      <MatchFilter />

      <Card className="overflow-hidden rounded-[20px]">
        <MatchRow match={live} href="/play" />
        <MatchRow match={matches[1]}>
          <div className="flex items-center gap-2.5 rounded-md border border-[#26262c] bg-surface-2 py-2.5 pr-2.5 pl-3">
            <Avatar>
              <AvatarFallback>{invite.initial}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">{invite.from} invited you</p>
              <p className="text-xs text-muted-foreground">Stake limit {invite.stakeLimit}</p>
            </div>
            <Button variant="outline" size="icon-sm" aria-label="Decline invite">
              <X />
            </Button>
            <Button asChild size="sm" className="h-9 rounded-sm px-3.5">
              <Link href="/league/new">Join</Link>
            </Button>
          </div>
        </MatchRow>
      </Card>

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
