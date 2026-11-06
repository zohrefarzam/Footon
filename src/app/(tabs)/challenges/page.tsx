import Link from "next/link";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { ChallengeList } from "@/components/footon/challenge-list";
import { HubTabs } from "@/components/footon/hub-tabs";
import { InviteStrip } from "@/components/footon/invite-strip";
import { Button } from "@/components/ui/button";
import { challengesWithMatch } from "@/lib/challenges";
import { invites, matches, predictionSlips } from "@/lib/mock-data";

/**
 * Challenges hub: pending invites to answer, then every challenge you're part
 * of as Joined · Invited · Expired, and the one lime action: start a new one.
 * Predictions sit next to it as the second title tab (`/predictions`).
 * Each row opens the challenge's own page (accept, predict, chat).
 */
export default function ChallengesPage() {
  const pending = invites.flatMap((i) => {
    const match = matches.find((m) => m.id === i.matchId);
    return match ? [{ ...i, match }] : [];
  });

  const openSlips = matches.filter((m) => m.status === "upcoming" && predictionSlips[m.id]?.length).length;

  return (
    <AppShell>
      <HubTabs
        count={openSlips}
        action={
          <Button asChild size="icon" className="mb-1 shrink-0 rounded-md" aria-label="New challenge">
            <Link href="/challenges/new">
              <Plus strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <div id="invites" className="scroll-mt-20">
        <InviteStrip invites={pending} />
      </div>

      <ChallengeList challenges={challengesWithMatch()} />
    </AppShell>
  );
}
