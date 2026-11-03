"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import type { Lineup, Team } from "@/lib/mock-data";
import { SegmentedTabs } from "./segmented-tabs";

/**
 * Starting XIs as one divided list per side, switched with a segmented filter.
 * Shirt number in the display font, position as a muted code. (The pitch view
 * stays on Fantasy; the pitch colours belong to that screen.)
 */
export function MatchLineups({ home, away, lineups }: { home: Team; away: Team; lineups: { home: Lineup; away: Lineup } }) {
  const [side, setSide] = useState(home.code);
  const isHome = side === home.code;
  const team = isHome ? home : away;
  const lineup = isHome ? lineups.home : lineups.away;

  return (
    <div className="flex flex-col gap-2.5">
      <SegmentedTabs label="Team" options={[home.code, away.code]} value={side} onValueChange={setSide} />
      <Card key={side} className="animate-in-up overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <span className="text-[13px] font-medium text-muted-foreground">{team.name}</span>
          <span className="font-display text-base font-bold">{lineup.formation}</span>
        </div>
        <ol aria-label={`${team.name} starting eleven, ${lineup.formation}`}>
          {lineup.players.map((p) => (
            <li key={p.number} className="flex items-center gap-3 border-t border-line px-4 py-2.5">
              <span className="w-7 font-display text-lg font-bold text-muted-foreground tabular-nums">{p.number}</span>
              <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{p.name}</span>
              <span className="font-mono text-xs font-medium text-muted-foreground">{p.pos}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
