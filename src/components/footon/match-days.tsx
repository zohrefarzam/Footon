"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dayLabel } from "@/lib/dates";
import { competitions, type Match } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { LiveDot } from "./live";
import { MatchRow } from "./match-row";

const DAYS = [-2, -1, 0, 1, 2, 3, 4, 5];
const order = { live: 0, upcoming: 1, finished: 2 } as const;
const compOrder = Object.keys(competitions);

const href = (m: Match) => (m.status === "live" && m.league ? "/play" : `/match/${m.id}`);
const sort = (list: Match[]) =>
  list.toSorted((a, b) => order[a.status] - order[b.status] || (a.kickoff ?? "").localeCompare(b.kickoff ?? ""));

/** One folding group (FotMob's competition block): header row + divided match rows. */
function Group({ title, code, list }: { title: string; code?: string; list: Match[] }) {
  const live = list.some((m) => m.status === "live");
  return (
    <details open className="group overflow-hidden rounded-[20px] border border-line bg-surface">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-2.5 px-4 text-[13px] font-semibold outline-none select-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60 [&::-webkit-details-marker]:hidden">
        {code ? (
          <span className="rounded-[5px] bg-surface-3 px-1 py-px font-mono text-[11px] font-medium text-muted-foreground">{code}</span>
        ) : null}
        <span className="flex-1 truncate">{title}</span>
        {live && <LiveDot />}
        <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground transition-transform duration-200 ease-spring group-open:rotate-180" />
      </summary>
      <div className="border-t border-line">
        {sort(list).map((m) => (
          <MatchRow key={m.id} match={m} href={href(m)} />
        ))}
      </div>
    </details>
  );
}

/** Your matches pinned first (FotMob's "Following"), then one group per competition. */
function Groups({ list, empty }: { list: Match[]; empty: string }) {
  if (!list.length)
    return (
      <p className="bg-dots rounded-[20px] border border-dashed border-line-strong px-6 py-10 text-center text-sm text-muted-foreground">{empty}</p>
    );
  const yours = list.filter((m) => m.you || m.league);
  const rest = list.filter((m) => !(m.you || m.league));
  const comps = [...new Set(rest.map((m) => m.competition))].toSorted((a, b) => compOrder.indexOf(a) - compOrder.indexOf(b));
  return (
    <>
      {yours.length > 0 && <Group title="Your matches" list={yours} />}
      {comps.map((c) => (
        <Group key={c} title={`${competitions[c]?.country ?? ""} · ${c}`} code={competitions[c]?.code} list={rest.filter((m) => m.competition === c)} />
      ))}
    </>
  );
}

/**
 * The Live tab, after FotMob's Matches screen: a scrollable day strip
 * (Yesterday · Today · Tomorrow · dates) and a Live pill that narrows everything
 * to what's on right now. No CTA: every row opens its match.
 */
export function MatchDays({ matches }: { matches: Match[] }) {
  const [day, setDay] = useState("0");
  const [liveOnly, setLiveOnly] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const live = matches.filter((m) => m.status === "live");

  // start with Today centred in the strip
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("[data-state=active]");
    if (list && active) list.scrollLeft = active.offsetLeft - list.clientWidth / 2 + active.clientWidth / 2;
  }, [liveOnly]);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.03em]">Live</h1>
          <p className="text-[13px] text-muted-foreground" aria-live="polite">
            {live.length ? `${live.length} ${live.length === 1 ? "match" : "matches"} on now` : "Nothing on right now"}
          </p>
        </div>
        <button
          type="button"
          aria-pressed={liveOnly}
          onClick={() => setLiveOnly((v) => !v)}
          className={cn(
            "flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold outline-none transition-[transform,background-color,border-color,color] duration-200 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60",
            liveOnly ? "border-live/40 bg-live-soft text-live" : "border-line-strong bg-surface-2 text-muted-foreground hover:text-foreground",
          )}
        >
          {liveOnly ? <LiveDot /> : <span aria-hidden="true" className="size-[7px] rounded-full bg-[#52525b]" />}
          Live
          <span className="font-display text-[15px] font-bold">{live.length}</span>
        </button>
      </div>

      {liveOnly ? (
        <div className="animate-in-up flex flex-col gap-3" aria-live="polite">
          <Groups list={live} empty="Nothing live right now. Turn Live off to see today's fixtures." />
        </div>
      ) : (
        <Tabs value={day} onValueChange={setDay} className="flex flex-col gap-3">
          <TabsList ref={listRef} aria-label="Day" className="scroll-smooth">
            {DAYS.map((d) => (
              <TabsTrigger key={d} value={String(d)}>
                {dayLabel(d)}
              </TabsTrigger>
            ))}
          </TabsList>
          {DAYS.map((d) => (
            <TabsContent key={d} value={String(d)} className="flex flex-col gap-3">
              <Groups list={matches.filter((m) => (m.dayOffset ?? 0) === d)} empty={`No matches ${d === 0 ? "today" : `on ${dayLabel(d)}`}.`} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </>
  );
}
