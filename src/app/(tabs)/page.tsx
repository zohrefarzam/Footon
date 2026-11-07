import { AppShell } from "@/components/footon/app-shell";
import { AchievementBadge } from "@/components/footon/achievement-badge";
import { BoostBadge } from "@/components/footon/boost-badge";
import { ChallengeRow } from "@/components/footon/challenge-list";
import { DivisionCard } from "@/components/footon/division-card";
import { EmptyState } from "@/components/footon/empty-state";
import { FantasyUnlock } from "@/components/footon/fantasy-unlock";
import { InviteTile } from "@/components/footon/invite-tile";
import { LeagueCard } from "@/components/footon/league-card";
import { MatchHero } from "@/components/footon/match-hero";
import { MatchRow } from "@/components/footon/match-row";
import { ResultCard } from "@/components/footon/result-card";
import { SectionHeading } from "@/components/footon/section-heading";
import { ShopPreview } from "@/components/footon/shop-preview";
import { Card } from "@/components/ui/card";
import { challengeHref, challengesWithMatch } from "@/lib/challenges";
import { longDate } from "@/lib/dates";
import { achievements, division, fantasyProgress, invites, liveQuestion, matches, shop } from "@/lib/mock-data";
import { ordinal } from "@/lib/utils";

const SHOP_PICKS = ["celebration", "banter", "league-look"];

/**
 * Home is matchday: the one match that matters now (your live league match,
 * else the next big one) as a floodlit match hero with the screen's lime
 * action → the big 2x fixtures open for predictions → your leagues as
 * competition cards → your division rank → your latest result and trophies →
 * invites, Fantasy and the shop.
 * Phones read that order top to bottom; desktop splits it into the match
 * column and the competition column.
 */
export default function HomePage() {
  const mine = challengesWithMatch();
  const liveLeague = mine.find((c) => c.status === "joined" && c.match.status === "live");
  const featured = liveLeague?.match ?? matches.find((m) => m.boost && m.status === "upcoming");
  const big = matches.filter((m) => m.boost && m.status !== "finished" && m.id !== featured?.id);
  const otherLeagues = mine.filter((c) => c.status === "joined" && c.id !== liveLeague?.id);
  const last = mine.find((c) => c.status === "finished" && c.match.you);
  const earned = achievements.filter((a) => a.earned).slice(0, 3);
  const shopItems = shop.flatMap((g) => g.items).filter((i) => SHOP_PICKS.includes(i.id));

  const standing = liveLeague?.table?.findIndex((r) => r.you) ?? -1;

  return (
    <AppShell wide className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-x-6">
      <h1 className="sr-only">Home</h1>

      {/* match column (on phones its parts interleave with the competition column, by `order`) */}
      <div className="contents lg:flex lg:flex-col lg:gap-[18px]">
        {featured ? (
          <div className="order-1 lg:order-none">
            <MatchHero
              match={featured}
              eyebrow={`Matchday · ${longDate(featured.dayOffset)}`}
              league={
                liveLeague && {
                  name: liveLeague.name,
                  place: standing >= 0 ? `${ordinal(standing + 1)} of ${liveLeague.table!.length}` : undefined,
                }
              }
              question={liveLeague ? { label: `Q${liveQuestion.index}`, text: liveQuestion.text } : undefined}
              cta={
                liveLeague
                  ? { label: `Answer Q${liveQuestion.index} now`, href: "/play" }
                  : { label: "Make your predictions", href: `/match/${featured.id}` }
              }
            />
          </div>
        ) : (
          <div className="order-1 lg:order-none">
            <EmptyState title="No matches today" body="Every fixture is on the Live tab. Pick one and make a call." action={{ label: "Browse matches", href: "/live" }} />
          </div>
        )}

        {big.length > 0 && (
          <section aria-labelledby="home-big" className="order-2 flex flex-col gap-2.5 lg:order-none">
            <SectionHeading id="home-big" title="Big fixtures" meta={<BoostBadge label="Wins pay" />} action={{ label: "All matches", href: "/live" }} />
            <Card className="overflow-hidden">
              {big.map((m) => (
                <MatchRow key={m.id} match={m} href={m.status === "live" && m.league ? "/play" : `/match/${m.id}`} />
              ))}
            </Card>
          </section>
        )}

        {last && (
          <section aria-labelledby="home-result" className="order-5 flex flex-col gap-2.5 lg:order-none">
            <SectionHeading id="home-result" title="Results" action={{ label: "Trophies", href: "/me#achievements" }} />
            <ResultCard
              match={last.match}
              league={{ name: last.name, rank: last.rank, players: last.members.length }}
              href={`/match/${last.match.id}`}
            />
            {earned.length > 0 && (
              <ul aria-label="Latest achievements" className="grid grid-cols-3 gap-2">
                {earned.map((a) => (
                  <li key={a.id} className="flex">
                    <AchievementBadge achievement={a} className="flex-1" />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {/* competition column */}
      <div className="contents lg:flex lg:flex-col lg:gap-[18px]">
        {(liveLeague || otherLeagues.length > 0) && (
          <section aria-labelledby="home-leagues" className="order-3 flex flex-col gap-2.5 lg:order-none">
            <SectionHeading
              id="home-leagues"
              title="Your leagues"
              action={{ label: "All", href: "/challenges" }}
            />
            {liveLeague && <LeagueCard league={liveLeague} href={challengeHref(liveLeague)} />}
            {otherLeagues.length > 0 && (
              <Card className="overflow-hidden">
                {otherLeagues.map((c) => (
                  <ChallengeRow key={c.id} c={c} />
                ))}
              </Card>
            )}
          </section>
        )}

        <section aria-label="Your division" className="order-4 lg:order-none">
          <DivisionCard division={division} />
        </section>

        {/* compact tiles: invites and fantasy stay tile-sized */}
        <div className="order-6 flex gap-2.5 lg:order-none">
          {invites.length > 0 && <InviteTile invites={invites} className="flex-1" />}
          <FantasyUnlock done={fantasyProgress.done} total={fantasyProgress.total} className="flex-[1.4]" />
        </div>

        {shopItems.length > 0 && (
          <div className="order-7 lg:order-none">
            <ShopPreview items={shopItems} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
