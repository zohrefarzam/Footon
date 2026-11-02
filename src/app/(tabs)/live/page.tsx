import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { EmptyState } from "@/components/footon/empty-state";
import { MatchRow } from "@/components/footon/match-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { matches } from "@/lib/mock-data";

/**
 * Live tab: every match on right now, and the one lime way in. Open calls and
 * match cards with quick calls land in Phase 4.
 */
export default function LivePage() {
  const live = matches.filter((m) => m.status === "live");
  const first = live[0];

  return (
    <AppShell>
      <h1 className="text-[26px] font-bold tracking-[-0.03em]">Live</h1>

      {first ? (
        <>
          <Card className="overflow-hidden rounded-[20px]">
            {live.map((m) => (
              <MatchRow key={m.id} match={m} href="/play" />
            ))}
          </Card>
          <Button asChild size="lg">
            <Link href="/play">
              Play {first.home.code} v {first.away.code}
              <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
            </Link>
          </Button>
        </>
      ) : (
        <EmptyState title="Nothing live" body="Matches show up here the moment they kick off." action={{ label: "See fixtures", href: "/" }} />
      )}
    </AppShell>
  );
}
