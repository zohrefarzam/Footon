import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { ChallengeList } from "@/components/footon/challenge-list";
import { InviteStrip } from "@/components/footon/invite-strip";
import { LockedFeatureGate } from "@/components/footon/gamification/locked-feature-gate";
import { Button } from "@/components/ui/button";
import { challengesWithMatch } from "@/lib/challenges";
import { invites, matches } from "@/lib/mock-data";

/**
 * Challenges hub: pending invites to answer, then every challenge you're part
 * of as Joined • Invited • Expired, and the one lime action: start a new one.
 * Each row opens the challenge's own page (accept, predict, chat).
 */
export default function ChallengesPage() {
  const pending = invites.flatMap((i) => {
    const match = matches.find((m) => m.id === i.matchId);
    return match ? [{ ...i, match }] : [];
  });

  return (
    <AppShell>
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] leading-tight font-bold">چالش‌ها</h1>
        <LockedFeatureGate feature="createLeague" variant="button" size="sm" title="چالش تازه">
          <Button asChild size="sm" className="h-9 gap-1 rounded-full ps-3 pe-3.5 text-[13px]">
            <Link href="/challenges/new">
              <Plus className="size-4" strokeWidth={2.6} aria-hidden="true" />
              چالش تازه
            </Link>
          </Button>
        </LockedFeatureGate>
      </header>

      <div id="invites" className="scroll-mt-20">
        <InviteStrip invites={pending} />
      </div>

      <ChallengeList challenges={challengesWithMatch()} />
    </AppShell>
  );
}
