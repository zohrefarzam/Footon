import { AppShell } from "@/components/footon/app-shell";
import { BoostBadge } from "@/components/footon/boost-badge";
import { EmptyState } from "@/components/footon/empty-state";
import { FantasyUnlock } from "@/components/footon/fantasy-unlock";
import { InviteTile } from "@/components/footon/invite-tile";
import { MatchRow } from "@/components/footon/match-row";
import { PromoCarousel } from "@/components/footon/promo-banner";
import { SectionHeading } from "@/components/footon/section-heading";
import { ShopPreview } from "@/components/footon/shop-preview";
import { Card } from "@/components/ui/card";
import { fantasyProgress, invites, matches, promos, shop } from "@/lib/mock-data";

const SHOP_PICKS = ["celebration", "banter", "league-look"];

/**
 * Home, kept short: the partner slot (sponsor banners), tonight's big 2x
 * fixtures, then invites and Fantasy as tiles and the shop preview. Your
 * leagues live on Challenges, standings on the Leaderboard, results on each
 * match; every fixture is on the Live tab.
 */
export default function HomePage() {
  const big = matches.filter((m) => m.boost && m.status !== "finished");
  const shopItems = shop.flatMap((g) => g.items).filter((i) => SHOP_PICKS.includes(i.id));

  return (
    <AppShell>
      <h1 className="sr-only">Home</h1>

      <PromoCarousel promos={promos} />

      {big.length > 0 ? (
        <section aria-labelledby="home-big" className="flex flex-col gap-2.5">
          <SectionHeading id="home-big" title="Big fixtures" meta={
              <>
                <BoostBadge label="Wins pay" className="max-[359px]:hidden" />
                <BoostBadge className="min-[360px]:hidden" />
              </>
            } action={{ label: "All matches", href: "/live" }} />
          <Card className="overflow-hidden">
            {big.map((m) => (
              <MatchRow key={m.id} match={m} href={m.status === "live" && m.league ? "/play" : `/match/${m.id}`} />
            ))}
          </Card>
        </section>
      ) : (
        <EmptyState title="Nothing big on yet" body="Every fixture is on the Live tab. Pick one and make a call." action={{ label: "Browse matches", href: "/live" }} />
      )}

      {/* compact tiles: invites and fantasy stay tile-sized */}
      <div className="flex gap-2.5">
        {invites.length > 0 && <InviteTile invites={invites} className="flex-1" />}
        <FantasyUnlock done={fantasyProgress.done} total={fantasyProgress.total} className="flex-[1.4]" />
      </div>

      {shopItems.length > 0 && <ShopPreview items={shopItems} />}
    </AppShell>
  );
}
