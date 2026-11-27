import Link from "next/link";
import { Swords } from "lucide-react";

import { LockedFeatureGate } from "@/components/footon/gamification/locked-feature-gate";
import { Button } from "@/components/ui/button";

/** On a big (2x) match's own page: start a league on this match. Secondary, because Lock in is the page's one lime action. */
export function ChallengeCta({ matchId }: { matchId: string }) {
  return (
    <LockedFeatureGate feature="createLeague" title="چالش تازه" variant="button" size="sm">
      <Button asChild variant="secondary" className="w-full">
        <Link href={`/challenges/new?match=${encodeURIComponent(matchId)}`}>
          <Swords aria-hidden="true" />
          روی این بازی چالش بساز
        </Link>
      </Button>
    </LockedFeatureGate>
  );
}
