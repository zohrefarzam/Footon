"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Plus } from "lucide-react";

import type { Team } from "@/lib/mock-data";
import { SCORE_MAX } from "@/lib/predictions";
import { cn } from "@/lib/utils";
import { PitchMarkings } from "./pitch-markings";
import { TeamCrest } from "./team-crest";

/** One side's stepper: − big number +. The number rolls up or down as it changes. */
function Stepper({ team, value, set, active }: { team: Team; value: number; set: (n: number) => void; active: boolean }) {
  const reduce = useReducedMotion();
  const btn =
    "flex size-11 items-center justify-center rounded-md border border-line-strong bg-surface-3 text-foreground outline-none transition-[transform,background-color] duration-150 ease-spring hover:bg-surface-4 active:scale-90 disabled:opacity-35 focus-visible:ring-[3px] focus-visible:ring-ring/60";
  return (
    <div className="flex min-w-0 flex-col items-center gap-2" role="group" aria-label={`${team.name} goals`}>
      <TeamCrest code={team.code} colors={team.colors} size="lg" />
      <span className="w-full truncate text-center text-[13px] font-semibold">{team.name}</span>
      <div className="flex items-center gap-1 max-[379px]:flex-col-reverse">
        <button type="button" className={btn} onClick={() => set(value - 1)} disabled={value <= 0} aria-label={`One fewer ${team.name} goal`}>
          <Minus className="size-4" strokeWidth={2.6} />
        </button>
        <span className="relative flex h-14 w-10 items-center justify-center overflow-hidden" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={reduce ? { opacity: 0 } : { y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: -18, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
              className={cn("font-display text-[52px] leading-none font-bold tabular-nums", !active && "text-subtle")}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </span>
        <button type="button" className={btn} onClick={() => set(value + 1)} disabled={value >= SCORE_MAX} aria-label={`One more ${team.name} goal`}>
          <Plus className="size-4" strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}

/**
 * "Call the score": the two sides face off on a pitch canvas, each with a
 * goal stepper. Untouched, the numbers sit dim at 0–0; the first tap makes it
 * a pick (it joins the slip below, where its stake lives).
 */
export function ScorePicker({
  home,
  away,
  value,
  onChange,
}: {
  home: Team;
  away: Team;
  /** Current call, or undefined while it isn't part of the slip. */
  value?: [number, number];
  onChange: (score: [number, number]) => void;
}) {
  const [h, a] = value ?? [0, 0];
  const clamp = (n: number) => Math.max(0, Math.min(SCORE_MAX, n));
  return (
    <section aria-labelledby="score-picker" className="relative isolate overflow-hidden rounded-2xl border border-line-strong bg-surface p-4 floodlight">
      <PitchMarkings corners className="-z-10" />
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="score-picker" className="font-display text-[17px] leading-none font-bold tracking-[0.04em] uppercase">
          Call the score
        </h3>
        <span className="text-xs text-muted-foreground">{value ? "In your slip" : "Tap + to call it"}</span>
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-1">
        <Stepper team={home} value={h} active={!!value} set={(n) => onChange([clamp(n), a])} />
        <span aria-hidden="true" className="pb-3 font-display text-[40px] leading-none font-bold text-dim">
          :
        </span>
        <Stepper team={away} value={a} active={!!value} set={(n) => onChange([h, clamp(n)])} />
      </div>
    </section>
  );
}
