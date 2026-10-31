"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import type { Match } from "@/lib/mock-data";
import { MatchRow } from "./match-row";
import { SegmentedTabs } from "./segmented-tabs";

const filters = ["Now", "Today", "Upcoming"] as const;
type Filter = (typeof filters)[number];

const order = { live: 0, upcoming: 1, finished: 2 } as const;

function pick(matches: Match[], f: Filter) {
  const list =
    f === "Now"
      ? matches.filter((m) => m.status === "live")
      : f === "Today"
        ? matches.filter((m) => !m.day)
        : matches.filter((m) => m.status === "upcoming");
  // live first, then by kickoff (today before later days), results last
  return list.toSorted(
    (a, b) => order[a.status] - order[b.status] || Number(!!a.day) - Number(!!b.day) || (a.kickoff ?? "").localeCompare(b.kickoff ?? ""),
  );
}

const empty: Record<Filter, string> = {
  Now: "Nothing live right now. Check Today.",
  Today: "No more matches today.",
  Upcoming: "No fixtures scheduled yet.",
};

/** Segmented filter + one divided list of match rows. Every row opens its match. */
export function MatchList({ matches, liveHref }: { matches: Match[]; liveHref: string }) {
  const [filter, setFilter] = useState<Filter>("Today");
  const list = pick(matches, filter);

  return (
    <>
      <SegmentedTabs label="Match filter" options={filters} value={filter} onValueChange={setFilter} />
      <Card key={filter} className="animate-in-up overflow-hidden rounded-[20px]" aria-live="polite">
        {list.length ? (
          list.map((m) => <MatchRow key={m.id} match={m} href={m.status === "live" ? liveHref : `/match/${m.id}`} />)
        ) : (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">{empty[filter]}</p>
        )}
      </Card>
    </>
  );
}
