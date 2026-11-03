import Link from "next/link";
import { ChevronRight, Pencil } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { BoostBadge } from "@/components/footon/boost-badge";
import { ChallengeRow } from "@/components/footon/challenge-list";
import { EmptyState } from "@/components/footon/empty-state";
import { FantasyUnlock } from "@/components/footon/fantasy-unlock";
import { InviteTile } from "@/components/footon/invite-tile";
import { MatchRow } from "@/components/footon/match-row";
import { TeamCrest } from "@/components/footon/team-crest";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { challengesWithMatch } from "@/lib/challenges";
import { fantasyProgress, invites, matches, predictionSlips } from "@/lib/mock-data";

const order = { live: 0, upcoming: 1, finished: 2 } as const;

function SectionTitle({ id, children, href }: { id: string; children: React.ReactNode; href?: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
      {children}
      {href && (
        <Link
          href={href}
          className="ms-auto -my-3 flex h-11 items-center gap-0.5 rounded-md ps-2 font-semibold outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
        >
          See all
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      )}
    </h2>
  );
}

/**
 * Home is yours: the challenges you're in, the predictions you can still edit,
 * invites and Fantasy as tiles, and tonight's big 2x matches. Browsing every
 * fixture is the Live tab's job.
 */
export default function HomePage() {
  const mine = challengesWithMatch()
    .filter((c) => c.status === "joined")
    .toSorted((a, b) => order[a.match.status] - order[b.match.status]);
  const slips = matches.filter((m) => m.status === "upcoming" && predictionSlips[m.id]?.length);
  const big = matches.filter((m) => m.boost && m.status !== "finished");

  return (
    <AppShell>
      <h1 className="sr-only">Home</h1>

      {mine.length === 0 && slips.length === 0 ? (
        <EmptyState title="Nothing on yet" body="Pick a match, set a prediction, or start a challenge with friends." action={{ label: "Browse matches", href: "/live" }} />
      ) : (
        <>
          {mine.length > 0 && (
            <section aria-labelledby="home-challenges" className="flex flex-col gap-2.5">
              <SectionTitle id="home-challenges" href="/challenges">
                Your challenges
              </SectionTitle>
              <Card className="overflow-hidden">
                {mine.map((c) => (
                  <ChallengeRow key={c.id} c={c} />
                ))}
              </Card>
            </section>
          )}

          {slips.length > 0 && (
            <section aria-labelledby="home-slips" className="flex flex-col gap-2.5">
              <SectionTitle id="home-slips">Open predictions</SectionTitle>
              <Card className="overflow-hidden">
                {slips.map((m) => {
                  const n = predictionSlips[m.id].length;
                  return (
                    <Link
                      key={m.id}
                      href={`/match/${m.id}`}
                      aria-label={`${m.home.name} v ${m.away.name}: ${n} predictions, edit until ${m.kickoff}${m.boost ? ", wins pay 2x" : ""}`}
                      className="flex items-center gap-3 px-4 py-3 outline-none transition-colors hover:bg-[#141417] focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60 [&+&]:border-t [&+&]:border-line"
                    >
                      <span className="flex shrink-0" aria-hidden="true">
                        <TeamCrest code={m.home.code} colors={m.home.colors} size="sm" />
                        <TeamCrest code={m.away.code} colors={m.away.colors} size="sm" className="-ms-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-[15px] font-semibold">
                          <span className="truncate max-[359px]:hidden">
                            {m.home.name} v {m.away.name}
                          </span>
                          <span className="font-display tracking-wide min-[360px]:hidden">
                            {m.home.code} v {m.away.code}
                          </span>
                          {m.boost && <BoostBadge />}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          <span className="font-display text-[13px] font-bold text-foreground">{n}</span> predictions · edit until{" "}
                          <span className="font-display text-[13px] font-bold text-foreground">
                            {m.day ? `${m.day} ` : ""}
                            {m.kickoff}
                          </span>
                        </span>
                      </span>
                      <Pencil className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  );
                })}
              </Card>
            </section>
          )}
        </>
      )}

      {/* compact tiles: invites and fantasy stay tile-sized */}
      <div className="flex gap-2.5">
        {invites.length > 0 && <InviteTile invites={invites} className="flex-1" />}
        <FantasyUnlock done={fantasyProgress.done} total={fantasyProgress.total} className="flex-[1.4]" />
      </div>

      {big.length > 0 && (
        <section aria-labelledby="home-big" className="flex flex-col gap-2.5">
          <SectionTitle id="home-big">
            Big matches <BoostBadge label="Wins pay" />
          </SectionTitle>
          <Card className="overflow-hidden">
            {big.map((m) => (
              <MatchRow key={m.id} match={m} href={m.status === "live" && m.league ? "/play" : `/match/${m.id}`} />
            ))}
          </Card>
        </section>
      )}

      <Button asChild variant="secondary" className="self-center">
        <Link href="/live">
          Browse all matches
          <ChevronRight className="rtl:rotate-180" aria-hidden="true" />
        </Link>
      </Button>
    </AppShell>
  );
}
