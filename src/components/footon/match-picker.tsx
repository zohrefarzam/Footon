"use client";

import { useSyncExternalStore } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { dayLabel } from "@/lib/dates";
import { dateKey } from "@/lib/football/fixtures";
import { useFixtureDays } from "@/lib/football/queries";
import type { Match } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { matchup } from "@/lib/format";
import { TeamCrest } from "./team-crest";

const noop = () => () => {};
const DAYS = [0, 1, 2, 3];

/** Which match the challenge is on: the next few days' kickoffs, one tap to choose. */
export function MatchPicker({ value, onChange }: { value: string | null; onChange: (m: Match) => void }) {
  const today = useSyncExternalStore(noop, () => dateKey(new Date()), () => null);
  const { matches, loading } = useFixtureDays(today, DAYS);
  const list = matches
    .filter((m) => m.status === "upcoming")
    .toSorted((a, b) => (a.dayOffset ?? 0) - (b.dayOffset ?? 0) || (a.kickoff ?? "").localeCompare(b.kickoff ?? ""))
    .slice(0, 12);

  return (
    <div className="flex flex-col gap-2">
      <span id="match-pick-label" className="text-[13px] font-medium text-muted-foreground">
        روی کدوم بازی؟
      </span>
      {loading ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">بازی پیش‌رویی پیدا نشد.</p>
      ) : (
        <div role="radiogroup" aria-labelledby="match-pick-label" className="max-h-72 overflow-y-auto rounded-lg border border-line bg-surface">
          {list.map((m) => {
            const on = m.id === value;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChange(m)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-start outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60 [&+&]:border-t [&+&]:border-line",
                  on ? "bg-primary-soft" : "hover:bg-surface-hover",
                )}
              >
                <span className="flex shrink-0" aria-hidden="true">
                  <TeamCrest code={m.home.code} colors={m.home.colors} logo={m.home.logo} size="xs" className="relative z-10 size-[28px]" />
                  <TeamCrest code={m.away.code} colors={m.away.colors} logo={m.away.logo} size="xs" className="-ms-2 size-[28px] opacity-90" />
                </span>
                <span className={cn("min-w-0 flex-1 truncate text-[15px] font-semibold", on && "text-primary")}>{matchup(m.home.name, m.away.name)}</span>
                <span className="shrink-0 font-display text-sm font-bold text-muted-foreground">
                  {m.dayOffset ? `${dayLabel(m.dayOffset, m.today)} ` : ""}
                  <span className="text-foreground">{m.kickoff}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
