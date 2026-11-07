import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dayLabel } from "@/lib/dates";
import type { Match } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { BoostBadge } from "./boost-badge";
import { Countdown } from "./countdown";
import { LeagueBadge } from "./league-badge";
import { LiveMinute } from "./live";
import { PitchMarkings } from "./pitch-markings";
import { TeamCrest } from "./team-crest";

/**
 * Home's match centre: the one fixture that matters most right now (your live
 * league match, else the next big one). A floodlit pitch canvas with the two
 * sides facing off in their colours, the score or the kickoff, the league it
 * counts for, and the screen's single lime action.
 * Team colours are data (like crests): a soft pool of each side's shirt colour
 * behind its crest, never on text.
 */
export function MatchHero({
  match: m,
  eyebrow,
  league,
  question,
  cta,
}: {
  match: Match;
  /** Top-left label, e.g. "Matchday · Tuesday 3 November". */
  eyebrow: string;
  /** Your league on this match and where you stand in it. */
  league?: { name: string; place?: string };
  /** The open live question, when there is one. */
  question?: { label: string; text: string };
  cta: { label: string; href: string };
}) {
  const live = m.status === "live";
  const [h, a] = m.score ?? [0, 0];
  const [homeShirt] = m.home.colors ?? ["#2e4b3f"];
  const [awayShirt] = m.away.colors ?? ["#2e4b3f"];

  return (
    <article
      aria-labelledby={`hero-${m.id}`}
      className="floodlight relative isolate overflow-hidden rounded-2xl border border-line-strong bg-surface"
    >
      {/* each side's colours, pooled behind its crest */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-90"
        style={{
          backgroundImage: `radial-gradient(60% 55% at 12% 46%, ${homeShirt}2e, transparent 70%), radial-gradient(60% 55% at 88% 46%, ${awayShirt}2e, transparent 70%)`,
        }}
      />
      <PitchMarkings className="-z-10" />
      {/* kit stripe: home colour | away colour */}
      <div aria-hidden="true" className="flex h-1">
        <span className="flex-1" style={{ background: homeShirt }} />
        <span className="flex-1" style={{ background: awayShirt }} />
      </div>

      <div className="flex flex-col gap-4 p-4 pt-3.5">
        <header className="flex items-center gap-2">
          <p className="min-w-0 truncate text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{eyebrow}</p>
          <span className="ms-auto flex shrink-0 items-center gap-1.5">
            {m.boost && <BoostBadge />}
            {live && <LiveMinute minute={m.minute ?? 0} />}
          </span>
        </header>

        <h2 id={`hero-${m.id}`} className="sr-only">
          {m.home.name} v {m.away.name}, {m.competition}
        </h2>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          {[m.home, m.away].map((t, i) => (
            <div key={t.code} className={cn("flex min-w-0 flex-col items-center gap-2 text-center", i === 1 && "col-start-3 row-start-1")}>
              <TeamCrest code={t.code} colors={t.colors} size="xl" className="size-16 text-base" />
              <span className="w-full truncate text-[15px] font-bold tracking-[-0.01em]">
                <span className="max-[359px]:hidden">{t.name}</span>
                <span className="font-display tracking-wide min-[360px]:hidden">{t.code}</span>
              </span>
              <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{i === 0 ? "Home" : "Away"}</span>
            </div>
          ))}

          <div className="col-start-2 row-start-1 flex min-w-[92px] flex-col items-center gap-1">
            {live || m.status === "finished" ? (
              <p className="font-display text-[56px] leading-none font-bold tabular-nums" aria-label={`${m.home.name} ${h}, ${m.away.name} ${a}`}>
                {h}
                <span className="mx-2 text-dim">:</span>
                {a}
              </p>
            ) : (
              <>
                <p className="font-display text-[44px] leading-none font-bold tabular-nums">{m.kickoff}</p>
                {(m.dayOffset ?? 0) === 0 && m.kickoff ? (
                  <Countdown kickoff={m.kickoff} className="font-display text-sm font-bold text-muted-foreground" />
                ) : (
                  <span className="text-[13px] font-medium text-muted-foreground">{dayLabel(m.dayOffset)}</span>
                )}
              </>
            )}
            <span className="text-center text-[11px] font-medium text-muted-foreground">{m.competition}</span>
          </div>
        </div>

        {(league || question) && (
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-background/55 p-3">
            {league && (
              <p className="flex items-center gap-2.5 text-[13px]">
                <LeagueBadge name={league.name} size="sm" />
                <span className="min-w-0 flex-1 truncate font-semibold">{league.name}</span>
                {league.place && <span className="shrink-0 text-muted-foreground">{league.place}</span>}
              </p>
            )}
            {question && (
              <p className="flex items-center gap-2 border-line text-[15px] font-semibold text-balance [&:not(:first-child)]:border-t [&:not(:first-child)]:pt-2">
                <span className="shrink-0 rounded-full bg-live-soft px-2 py-0.5 font-display text-[13px] font-bold text-live">{question.label}</span>
                <span className="min-w-0">{question.text}</span>
              </p>
            )}
          </div>
        )}

        <Button asChild size="lg" className="w-full justify-between ps-5 pe-4">
          <Link href={cta.href}>
            {cta.label}
            <span className="flex size-8 items-center justify-center rounded-sm bg-primary-foreground/10">
              <ArrowRight className="rtl:rotate-180" strokeWidth={2.4} aria-hidden="true" />
            </span>
          </Link>
        </Button>
      </div>
    </article>
  );
}
