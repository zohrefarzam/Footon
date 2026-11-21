import { AppShell } from "@/components/footon/app-shell";
import { BoostBadge } from "@/components/footon/boost-badge";
import { EmptyState } from "@/components/footon/empty-state";
import { HomeBigFixtures } from "@/components/footon/home-big-fixtures";
import { FantasyUnlock } from "@/components/footon/fantasy-unlock";
import { QuestsTile } from "@/components/footon/gamification/quests";
import { MatchRow } from "@/components/footon/match-row";
import { PromoCarousel } from "@/components/footon/promo-banner";
import { SectionHeading } from "@/components/footon/section-heading";
import { ShopPreview } from "@/components/footon/shop-preview";
import { Card } from "@/components/ui/card";
import { matches, promos } from "@/lib/mock-data";

/**
 * Home, kept short: the partner slot (sponsor banners), tonight's big 2x
 * fixtures, then quests (→ /quests) and Fantasy as one row of two tiles, and
 * the shop preview. Invites are a badge on the Challenges tab. Your
 * leagues live on Challenges, standings on the Leaderboard, results on each
 * match; every fixture is on the Live tab.
 */
export default function HomePage() {
  const big = matches.filter((m) => m.boost && m.status !== "finished");

  return (
    <AppShell>
      <h1 className="sr-only">خانه</h1>

      <PromoCarousel promos={promos} />

      {process.env.NEXT_PUBLIC_GAMIFICATION_API ? (
        <HomeBigFixtures />
      ) : big.length > 0 ? (
        <Card className="overflow-hidden">
          <section aria-labelledby="home-big">
            {/* the heading is the card's header, so the title and its matches read as one block */}
            <SectionHeading
              id="home-big"
              title="بازی‌های بزرگ"
              meta={<BoostBadge label="بردها" className="max-[359px]:hidden" />}
              action={{ label: "همهٔ بازی‌ها", href: "/live" }}
              className="border-b border-line ps-4 pe-3 pt-3.5 pb-3"
            />
            {big.map((m) => (
              <MatchRow key={m.id} match={m} showBoost={false} href={m.status === "live" && m.league ? "/play" : `/match/${m.id}`} />
            ))}
          </section>
        </Card>
      ) : (
        <EmptyState title="فعلاً بازی بزرگی نیست" body="همهٔ بازی‌ها توی بخش زنده‌ست. یکی را انتخاب کن و پیش‌بینی‌ات را بکن." action={{ label: "دیدن بازی‌ها", href: "/live" }} />
      )}

      {/* quests and fantasy share one row: same tile anatomy, equal halves */}
      <div className="grid grid-cols-2 gap-2.5">
        <QuestsTile />
        <FantasyUnlock />
      </div>

      <ShopPreview />
    </AppShell>
  );
}
