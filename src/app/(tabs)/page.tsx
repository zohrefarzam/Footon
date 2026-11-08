import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { BoostBadge } from "@/components/footon/boost-badge";
import { EmptyState } from "@/components/footon/empty-state";
import { FantasyUnlock } from "@/components/footon/fantasy-unlock";
import { QuestList } from "@/components/footon/gamification/quests";
import { InviteTile } from "@/components/footon/invite-tile";
import { MatchRow } from "@/components/footon/match-row";
import { ShopPreview } from "@/components/footon/shop-preview";
import { Card } from "@/components/ui/card";
import { invites, matches } from "@/lib/mock-data";

/**
 * Home: tonight's big 2x matches first (with a quiet "All matches" link to the
 * Live tab), then invites and Fantasy as tiles, then the shop preview. Your
 * challenges and open predictions live on the Challenges tab.
 */
export default function HomePage() {
  const big = matches.filter((m) => m.boost && m.status !== "finished");

  return (
    <AppShell>
      <h1 className="sr-only">Home</h1>

      {big.length > 0 ? (
        <section aria-labelledby="home-big" className="flex flex-col gap-2.5">
          <h2 id="home-big" className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
            Big matches <BoostBadge label="Wins pay" />
            <Link
              href="/live"
              className="ms-auto -my-3 flex h-11 items-center gap-0.5 rounded-md ps-2 font-semibold outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
            >
              All matches
              <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </h2>
          <Card className="overflow-hidden">
            {big.map((m) => (
              <MatchRow key={m.id} match={m} href={m.status === "live" && m.league ? "/play" : `/match/${m.id}`} />
            ))}
          </Card>
        </section>
      ) : (
        <EmptyState title="Nothing big on yet" body="Every fixture is on the Live tab. Pick one and make a call." action={{ label: "Browse matches", href: "/live" }} />
      )}

      <QuestList kinds={["daily"]} title="Today's quests" />
      <QuestList kinds={["weekly"]} title="This week" feature="weeklyQuests" />

      {/* compact tiles: invites and fantasy stay tile-sized */}
      <div className="flex gap-2.5">
        {invites.length > 0 && <InviteTile invites={invites} className="flex-1" />}
        <FantasyUnlock className="flex-[1.4]" />
      </div>

      <ShopPreview />
    </AppShell>
  );
}
