"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, Info, ListFilter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dayLabel } from "@/lib/dates";
import { dateKey } from "@/lib/football/fixtures";
import { useFixtureDays } from "@/lib/football/queries";
import { useClearSlip, useSoloMatchIds } from "@/lib/slips/api";
import { matches as mockMatches, type Match } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { matchup } from "@/lib/format";
import { TeamCrest } from "./team-crest";

const noop = () => () => {};
const DAYS = [0, 1, 2, 3];

/** Which match the challenge is on: the next few days' kickoffs, one tap to choose. */
export function MatchPicker({ value, onChange, matchId }: { value: string | null; onChange: (m: Match) => void; matchId?: string }) {
  const today = useSyncExternalStore(noop, () => dateKey(new Date()), () => null);
  // without a backend the mock fixtures stand in (and no request goes out)
  const mock = !process.env.NEXT_PUBLIC_GAMIFICATION_API;
  const fixtures = useFixtureDays(mock ? null : today, DAYS);
  const matches = mock ? mockMatches : fixtures.matches;
  const loading = !mock && fixtures.loading;
  // a match is either your own prediction or a challenge, never both
  const solo = useSoloMatchIds(!mock);
  const clear = useClearSlip();
  const [clearing, setClearing] = useState<string | null>(null);
  const [clearFailed, setClearFailed] = useState(false);
  const clearSlip = async (id: string) => {
    setClearing(id);
    setClearFailed(false);
    setClearFailed(!(await clear(id)));
    setClearing(null);
  };
  // a team narrows the list to its matches; a team with one match is picked for you
  const [chosen, setTeam] = useState<string | null>(null);
  const upcoming = matches.filter((m) => m.status === "upcoming");
  // arriving from a match page (`?match=`): that match is picked, and its home side filters the list so it shows
  const preset = matchId ? upcoming.find((x) => x.id === matchId) : undefined;
  const team = chosen ?? preset?.home.code ?? "";
  const teams = [...new Map(upcoming.flatMap((m) => [m.home, m.away]).map((t) => [t.code, t.name]))].toSorted((a, b) => a[1].localeCompare(b[1]));
  const playing = (code: string) => upcoming.filter((m) => m.home.code === code || m.away.code === code);
  const pickTeam = (code: string) => {
    setTeam(code);
    const own = code ? playing(code) : [];
    if (own.length === 1) onChange(own[0]);
  };
  useEffect(() => {
    if (preset && !value) onChange(preset);
  }, [preset, value, onChange]);
  const list = (team ? playing(team) : upcoming)
    .toSorted((a, b) => (a.dayOffset ?? 0) - (b.dayOffset ?? 0) || (a.kickoff ?? "").localeCompare(b.kickoff ?? ""))
    .slice(0, 12);

  return (
    <div className="flex flex-col gap-2">
      <span id="match-pick-label" className="text-[13px] font-medium text-muted-foreground">
        روی کدوم بازی؟
      </span>
      {loading ? (
        <Skeleton className="h-52 w-full rounded-xl" />
      ) : (
        // one card: the team filter on top, the matches under it, so they read as a single choice
        <div className="overflow-hidden rounded-xl border border-line bg-surface transition-[border-color,box-shadow] duration-150 focus-within:border-primary-line focus-within:ring-[3px] focus-within:ring-ring/25">
          {teams.length > 0 && (
            <div className="relative border-b border-line">
              <ListFilter className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <select
                aria-label="فیلتر تیم"
                value={team}
                onChange={(e) => pickTeam(e.target.value)}
                className={cn(
                  "h-12 w-full cursor-pointer appearance-none bg-transparent ps-11 pe-11 text-sm outline-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover",
                  team ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                <option value="">همهٔ تیم‌ها</option>
                {teams.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          {list.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">بازی پیش‌رویی پیدا نشد.</p>
          ) : (
            <div role="radiogroup" aria-labelledby="match-pick-label" className="max-h-72 overflow-y-auto">
              {list.map((m) => {
                const on = m.id === value;
                if (solo.has(m.id))
                  return (
                    <div key={m.id} className="flex w-full items-center gap-3 px-4 py-3 [&+&]:border-t [&+&]:border-line">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-muted-foreground">{matchup(m.home.name, m.away.name)}</span>
                        <span className="block text-xs text-muted-foreground">پیش‌بینی خودت روش ثبت شده</span>
                      </span>
                      <Button type="button" size="sm" variant="secondary" disabled={clearing === m.id} onClick={() => clearSlip(m.id)}>
                        {clearing === m.id ? "صبر کن…" : "پاک کردن پیش‌بینی"}
                      </Button>
                    </div>
                  );
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => onChange(m)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-start outline-none transition-colors [&+&]:border-t [&+&]:border-line",
                      on ? "bg-primary-soft focus-visible:bg-primary-soft/70" : "hover:bg-surface-hover focus-visible:bg-surface-3",
                    )}
                  >
                    {/* the radio dot: empty ring until picked, then a lime check */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        on ? "border-primary bg-primary text-primary-foreground" : "border-line-strong",
                      )}
                    >
                      {on && <Check className="size-3" strokeWidth={3.5} />}
                    </span>
                    <span className="flex shrink-0" aria-hidden="true">
                      <TeamCrest code={m.home.code} colors={m.home.colors} logo={m.home.logo} size="xs" className="relative z-10 size-[28px]" />
                      <TeamCrest code={m.away.code} colors={m.away.colors} logo={m.away.logo} size="xs" className="-ms-2 size-[28px] opacity-90" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[15px] font-semibold", on && "text-primary")}>{matchup(m.home.name, m.away.name)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {m.dayOffset ? dayLabel(m.dayOffset, m.today) : "امروز"} • <span className="font-display text-[13px] font-bold text-foreground">{m.kickoff}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      {clearFailed && (
        <p role="alert" className="text-xs text-loss">
          پیش‌بینی پاک نشد. یه بار دیگه امتحان کن.
        </p>
      )}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="size-3.5 shrink-0" aria-hidden="true" />
        هر بازی یا پیش‌بینی خودته یا چالش، نه هر دو.
      </p>
    </div>
  );
}
