"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dayLabel } from "@/lib/dates";
import { competitions, type Match } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { BallSwitch } from "./ball-switch";
import { LiveDot } from "./live";
import { MatchRow } from "./match-row";
import { formatNumber } from "@/lib/format";

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

/** One group per competition, in the competitions' order. Your own matches live on Home. */
function Groups({ list, empty }: { list: Match[]; empty: string }) {
  if (!list.length)
    return (
      <p className="bg-dots rounded-[20px] border border-dashed border-line-strong px-6 py-10 text-center text-sm text-muted-foreground">{empty}</p>
    );
  const comps = [...new Set(list.map((m) => m.competition))].toSorted((a, b) => compOrder.indexOf(a) - compOrder.indexOf(b));
  return (
    <>
      {comps.map((c) => (
        <Group key={c} title={`${competitions[c]?.country ?? ""} • ${c}`} code={competitions[c]?.code} list={list.filter((m) => m.competition === c)} />
      ))}
    </>
  );
}

/**
 * The Live tab, after FotMob's Matches screen: a scrollable day strip
 * (Yesterday • Today • Tomorrow • dates) and a Live pill that narrows everything
 * to what's on right now. No CTA: every row opens its match.
 */
export function MatchDays({ matches }: { matches: Match[] }) {
  const [day, setDay] = useState("0");
  const [liveOnly, setLiveOnly] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const live = matches.filter((m) => m.status === "live");

  // start with Today centred in the strip
  useEffect(() => {
    // scrollIntoView is direction-agnostic (scrollLeft runs negative in RTL)
    const active = listRef.current?.querySelector<HTMLElement>("[data-state=active]");
    active?.scrollIntoView?.({ behavior: "instant", block: "nearest", inline: "center" });
  }, [liveOnly]);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.03em]">زنده</h1>
          <p className="text-[13px] text-muted-foreground" aria-live="polite">
            {live.length ? `${formatNumber(live.length)} بازی در جریان` : "الان بازی‌ای در جریان نیست"}
          </p>
        </div>
        {/* a switch, not a toggle pill: on/off reads at a glance and the same tap turns it off. The thumb is the ball. */}
        <div className="flex shrink-0 items-center gap-2.5">
          <label
            htmlFor="live-only"
            className={cn("cursor-pointer text-sm font-semibold transition-colors duration-200 select-none", liveOnly ? "text-live" : "text-muted-foreground")}
          >
            فقط زنده
          </label>
          <BallSwitch id="live-only" checked={liveOnly} onCheckedChange={setLiveOnly} />
        </div>
      </div>

      {liveOnly ? (
        <div className="animate-in-up flex flex-col gap-3" aria-live="polite">
          <Groups list={live} empty="الان بازی زنده‌ای نیست. «فقط زنده» را خاموش کن تا بازی‌های امروز را ببینی." />
        </div>
      ) : (
        <Tabs value={day} onValueChange={setDay} className="flex flex-col gap-3">
          <TabsList ref={listRef} aria-label="روز" className="scroll-smooth">
            {DAYS.map((d) => (
              <TabsTrigger key={d} value={String(d)}>
                {dayLabel(d)}
              </TabsTrigger>
            ))}
          </TabsList>
          {DAYS.map((d) => (
            <TabsContent key={d} value={String(d)} className="flex flex-col gap-3">
              <Groups list={matches.filter((m) => (m.dayOffset ?? 0) === d)} empty={d === 0 ? "امروز بازی‌ای نیست." : `${dayLabel(d)} بازی‌ای نیست.`} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </>
  );
}
