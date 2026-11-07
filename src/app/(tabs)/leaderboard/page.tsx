import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { RankStrip, toPromotion } from "@/components/footon/division-card";
import { LeagueBadge } from "@/components/footon/league-badge";
import { PitchMarkings } from "@/components/footon/pitch-markings";
import { SectionHeading } from "@/components/footon/section-heading";
import { Standings } from "@/components/footon/standings";
import { Card } from "@/components/ui/card";
import { challengeHref, challengesWithMatch } from "@/lib/challenges";
import { division } from "@/lib/mock-data";
import { ordinal } from "@/lib/utils";

/**
 * Your division as a football table: a floodlit header with your place, the
 * gap to promotion and the whole table as a rank strip; then the table itself
 * (medals for the top three, promotion and drop lines, your row soft-lime);
 * then your friends' leagues, each opening its own table.
 * Points only: coins never change a place here.
 */
export default function LeaderboardPage() {
  const d = division;
  const you = d.rows.find((r) => r.you);
  const need = toPromotion(d);
  const leagues = challengesWithMatch().filter((c) => (c.status === "joined" || c.status === "finished") && c.table?.length);

  return (
    <AppShell wide className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-x-6">
      <header className="floodlight relative isolate flex flex-col gap-4 overflow-hidden rounded-2xl border border-line-strong bg-surface p-4 lg:col-span-2">
        <PitchMarkings variant="box" className="-z-10" />
        <div className="flex items-center gap-3">
          <LeagueBadge name={d.name} tone="silver" size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Week {d.week} · ends in {d.endsIn}
            </p>
            <h1 className="mt-0.5 font-display text-[32px] leading-none font-bold tracking-[0.02em] uppercase">{d.name} division</h1>
          </div>
        </div>
        {you?.rank && (
          <>
            <div className="flex items-end justify-between gap-4">
              <p className="font-display text-[64px] leading-[0.85] font-bold text-primary">
                {ordinal(you.rank)}
                <span className="ms-2 text-2xl text-muted-foreground">of {d.size}</span>
              </p>
              <dl className="flex gap-4 pb-1 text-end">
                <div className="flex flex-col-reverse">
                  <dt className="text-[11px] text-muted-foreground">points</dt>
                  <dd className="font-display text-[26px] leading-none font-bold">{you.points.toLocaleString("en-US")}</dd>
                </div>
                <div className="flex flex-col-reverse">
                  <dt className="text-[11px] text-muted-foreground">to promotion</dt>
                  <dd className="font-display text-[26px] leading-none font-bold">{need ? need.toLocaleString("en-US") : "In"}</dd>
                </div>
              </dl>
            </div>
            <RankStrip rank={you.rank} size={d.size} promote={d.promote} relegate={d.relegate} />
            <p className="text-xs text-muted-foreground">
              Top {d.promote} go up a division, bottom {d.relegate} go down when the week ends. Only right calls earn points.
            </p>
          </>
        )}
      </header>

      <section aria-labelledby="lb-table" className="flex flex-col gap-2.5">
        <SectionHeading id="lb-table" title="Table" meta={<span className="text-xs font-medium text-muted-foreground">{d.size} players</span>} />
        <Card className="overflow-hidden pb-1">
          <Standings rows={d.rows} caption={`${d.name} division, week ${d.week}`} zones={{ promote: d.promote, relegate: d.relegate, size: d.size }} />
        </Card>
      </section>

      {leagues.length > 0 && (
        <section aria-labelledby="lb-leagues" className="flex flex-col gap-2.5">
          <SectionHeading id="lb-leagues" title="Friends' leagues" />
          <Card className="overflow-hidden">
            {leagues.map((c) => {
              const i = c.table!.findIndex((r) => r.you);
              return (
                <Link
                  key={c.id}
                  href={`${challengeHref(c)}#league`}
                  className="flex items-center gap-3 px-4 py-3.5 outline-none transition-colors hover:bg-surface-hover focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60 [&+&]:border-t [&+&]:border-line"
                >
                  <LeagueBadge name={c.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{c.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {c.table!.length} players · {c.status === "finished" ? "final table" : `${c.match.home.code} v ${c.match.away.code}`}
                    </span>
                  </span>
                  {i >= 0 && (
                    <span className={i === 0 && c.status === "finished" ? "font-display text-xl font-bold text-gold" : "font-display text-xl font-bold text-primary"}>
                      {ordinal(i + 1)}
                    </span>
                  )}
                  <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
                </Link>
              );
            })}
          </Card>
        </section>
      )}
    </AppShell>
  );
}
