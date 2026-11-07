import { dayLabel } from "@/lib/dates";
import type { Match } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { BoostBadge } from "./boost-badge";
import { Countdown } from "./countdown";
import { LiveMinute } from "./live";
import { PitchMarkings } from "./pitch-markings";
import { TeamCrest } from "./team-crest";

/**
 * The big scoreboard at the top of every match page, on the dotted canvas:
 * xl crests and names (scorers and red cards underneath), and in the middle
 *   live     → score + LIVE minute + match clock bar
 *   upcoming → kickoff in display font + countdown (today) or the day
 *   finished → score + FULL TIME
 */
export function MatchScoreboard({ match: m }: { match: Match }) {
  const [h, a] = m.score ?? [0, 0];
  const live = m.status === "live";
  const minute = m.minute ?? 0;
  const events = m.events ?? [];
  const goals = events.filter((e) => e.kind === "goal");
  const reds = events.filter((e) => e.kind === "red");

  const [homeShirt] = m.home.colors ?? ["#2e4b3f"];
  const [awayShirt] = m.away.colors ?? ["#2e4b3f"];

  return (
    <section aria-label="Score" className="floodlight relative isolate -mx-5 flex flex-col gap-4 overflow-hidden border-b border-line px-5 pt-3 pb-5">
      {/* the pitch under the board, and each side's colours pooled behind its crest (data, like the crests) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(45% 70% at 16% 34%, ${homeShirt}29, transparent 70%), radial-gradient(45% 70% at 84% 34%, ${awayShirt}29, transparent 70%)`,
        }}
      />
      <PitchMarkings className="-z-10" />
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        {(["home", "away"] as const).map((side, i) => {
          const t = m[side];
          return (
            <div key={side} className={cn("flex flex-col items-center gap-1.5 text-center", i === 1 && "col-start-3 row-start-1")}>
              <TeamCrest code={t.code} colors={t.colors} size="xl" />
              <span className="flex items-center gap-1.5 text-sm font-bold">
                {t.name}
                {reds
                  .filter((e) => e.side === side)
                  .map((e) => (
                    <span key={e.minute} role="img" aria-label="red card" className="h-3 w-2 rounded-[2px] bg-booking-red" />
                  ))}
              </span>
              {goals.some((e) => e.side === side) && (
                <ul className="text-xs text-muted-foreground" aria-label={`${t.name} scorers`}>
                  {goals
                    .filter((e) => e.side === side)
                    .map((e) => (
                      <li key={e.minute}>
                        {e.player} <span className="font-display">{e.minute}&apos;</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          );
        })}

        <div className="col-start-2 row-start-1 flex flex-col items-center gap-1 pt-1">
          {m.status === "upcoming" ? (
            <>
              <p className="font-display text-[56px] leading-none font-bold">{m.kickoff}</p>
              {(m.dayOffset ?? 0) === 0 && m.kickoff ? (
                <Countdown kickoff={m.kickoff} className="font-display text-base font-bold text-muted-foreground" />
              ) : (
                <span className="text-[13px] font-medium text-muted-foreground">{dayLabel(m.dayOffset)}</span>
              )}
              {m.boost && <BoostBadge label="Wins pay" className="mt-1" />}
            </>
          ) : (
            <>
              <p aria-live={live ? "polite" : undefined} aria-label={`${m.home.name} ${h}, ${m.away.name} ${a}`} className="font-display text-[64px] leading-none font-bold">
                {h}
                <span className="mx-2.5 text-dim">:</span>
                {a}
              </p>
              {live ? (
                <LiveMinute minute={minute} className="text-sm" />
              ) : (
                <span className="font-display text-sm font-bold text-muted-foreground">FULL TIME</span>
              )}
            </>
          )}
        </div>
      </div>

      {live && (
        /* match clock: the dot is now, ticks above/below are home/away goals */
        <div
          className="relative mx-1 h-1 rounded-full bg-line"
          role="img"
          aria-label={`Minute ${minute} of 90${goals.length ? `. Goals at ${goals.map((e) => `${e.minute}'`).join(", ")}` : ""}`}
        >
          <div className="absolute inset-y-0 start-0 rounded-full bg-dim" style={{ width: `${(minute / 90) * 100}%` }} />
          <span className="absolute -top-[3px] start-1/2 h-2.5 w-px bg-dim-strong" />
          {goals.map((e) => (
            <span
              key={e.minute}
              className={cn("absolute size-1.5 -translate-x-1/2 rounded-full bg-muted-foreground rtl:translate-x-1/2", e.side === "home" ? "-top-2.5" : "top-2")}
              style={{ insetInlineStart: `${(e.minute / 90) * 100}%` }}
            />
          ))}
          <span
            className="absolute -top-1 size-3 -translate-x-1/2 rounded-full border-[3px] border-background bg-foreground rtl:translate-x-1/2"
            style={{ insetInlineStart: `${(minute / 90) * 100}%` }}
          />
        </div>
      )}
    </section>
  );
}

/** One-line score for the top bar once the scoreboard has scrolled away. */
export function CompactScore({ match: m }: { match: Match }) {
  const [h, a] = m.score ?? [0, 0];
  return (
    <span className="flex items-center gap-2 font-display text-lg font-bold">
      <span className="text-muted-foreground">{m.home.code}</span>
      {m.status === "upcoming" ? (
        m.kickoff
      ) : (
        <>
          {h}
          <span className="text-dim">:</span>
          {a}
        </>
      )}
      <span className="text-muted-foreground">{m.away.code}</span>
      {m.status === "live" && <LiveMinute minute={m.minute ?? 0} className="ms-auto" />}
      {m.status === "finished" && <span className="ms-auto text-sm text-muted-foreground">FT</span>}
    </span>
  );
}
