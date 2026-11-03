"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Card } from "@/components/ui/card";
import type { Team } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { TeamCrest } from "./team-crest";

type Pick = "home" | "draw" | "away";

/**
 * "Who wins?" one-tap poll (the FotMob pattern): three choices, and the crowd's
 * split is hidden until you vote, so you call it before you see it. After the
 * vote each choice fills to its share; yours is soft-lime ("this is you").
 * Free and coin-less: it is the warm-up call, not a stake.
 */
export function CrowdPoll({
  home,
  away,
  crowd,
  className,
}: {
  home: Team;
  away: Team;
  crowd: { home: number; draw: number; away: number; votes: number };
  className?: string;
}) {
  const [pick, setPick] = useState<Pick | null>(null);
  const reduce = useReducedMotion();
  const votes = crowd.votes + (pick ? 1 : 0);

  const options: { id: Pick; label: string; team?: Team }[] = [
    { id: "home", label: home.name, team: home },
    { id: "draw", label: "Draw" },
    { id: "away", label: away.name, team: away },
  ];

  return (
    <Card className={cn("gap-3 p-4", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Who wins?</h3>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          <span className="font-display text-sm font-bold text-foreground">{votes.toLocaleString("en-US")}</span> votes
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Who wins?">
        {options.map((o) => {
          const on = pick === o.id;
          const share = crowd[o.id];
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              disabled={!!pick}
              aria-label={pick ? `${o.label}, ${share}%${on ? ", your pick" : ""}` : o.label}
              onClick={() => setPick(o.id)}
              className={cn(
                "relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-md border text-sm font-semibold outline-none",
                "transition-[transform,border-color,color] duration-200 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:active:scale-100",
                on ? "border-primary-line text-primary" : "border-line-strong text-foreground",
                pick && !on && "text-muted-foreground",
              )}
            >
              {pick && (
                <motion.span
                  aria-hidden="true"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: share / 100 }}
                  transition={{ type: "spring", stiffness: 140, damping: 22 }}
                  className={cn("absolute inset-0 origin-left rtl:origin-right", on ? "bg-primary-soft" : "bg-line-strong")}
                />
              )}
              <span className="relative flex items-center gap-2">
                {o.team ? <TeamCrest code={o.team.code} colors={o.team.colors} size="xs" /> : null}
                {pick ? (
                  <span className="font-display text-lg font-bold">{share}%</span>
                ) : o.team ? (
                  <span className="font-display text-[15px] tracking-wide">{o.team.code}</span>
                ) : (
                  o.label
                )}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
