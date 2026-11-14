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
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">چالش‌ها</h1>
        <LockedFeatureGate feature="createLeague" variant="button" size="sm" title="چالش تازه">
          <Button asChild size="sm" className="h-10 rounded-sm px-3.5">
            <Link href="/challenges/new">
              <Plus strokeWidth={2.4} aria-hidden="true" />
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
