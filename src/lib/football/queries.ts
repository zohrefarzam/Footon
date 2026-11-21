"use client";

import { useQueries, useQuery } from "@tanstack/react-query";

import { getJson } from "@/lib/api/get";
import { Fixtures, toMatch } from "./fixtures";
import { FixtureDetails, FormRes, H2H, Lineups, Standings, Statistics, type MatchBundle } from "./match";
import type { Match } from "@/lib/mock-data";

const tz = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const addDays = (key: string, d: number) => new Date(Date.parse(`${key}T00:00:00Z`) + d * 86_400_000).toISOString().slice(0, 10);

/**
 * Every fixture for the given day offsets around `today` (the viewer's local
 * date key), plus whatever is live now, as `Match`es. Live is polled.
 */
export function useFixtureDays(today: string | null, offsets: number[]) {
  const days = useQueries({
    queries: offsets.map((o) => ({
      queryKey: ["football", "fixtures", today, o],
      queryFn: () => getJson(`football/fixtures?date=${addDays(today!, o)}&tz=${encodeURIComponent(tz())}`, Fixtures),
      enabled: !!today,
      staleTime: 60_000,
    })),
  });
  const live = useQuery({
    queryKey: ["football", "live"],
    queryFn: () => getJson("football/fixtures/live", Fixtures),
    enabled: !!today,
    refetchInterval: 30_000,
  });

  const loading = !today || days.some((d) => d.isPending) || live.isPending;
  const error = days.length > 0 && days.every((d) => d.isError) && live.isError;
  const byId = new Map<string, Match>();
  if (today) {
    // the live endpoint wins: it is fresher than the day lists
    for (const f of [...days.flatMap((d) => d.data ?? []), ...(live.data ?? [])]) byId.set(f.id, toMatch(f, today));
  }
  return { matches: [...byId.values()], loading, error };
}

/** Optional pieces never fail the page: a 404 (no lineups yet, no table) just leaves that section out. */
const maybe = <T,>(p: Promise<T>) => p.catch(() => undefined);

export function useMatchBundle(id: string) {
  return useQuery<MatchBundle>({
    queryKey: ["football", "match", id],
    queryFn: async () => {
      const details = await getJson(`football/fixtures/${id}`, FixtureDetails);
      const f = details.fixture;
      const [stats, lineups, h2h, form, standings] = await Promise.all([
        maybe(getJson(`football/fixtures/${id}/statistics`, Statistics)),
        maybe(getJson(`football/fixtures/${id}/lineups`, Lineups)),
        maybe(getJson(`football/fixtures/${id}/head-to-head`, H2H)),
        maybe(getJson(`football/fixtures/${id}/form`, FormRes)),
        f.season ? maybe(getJson(`football/competitions/${f.competition.id}/standings?season=${f.season}`, Standings)) : undefined,
      ]);
      return { details, stats, lineups, h2h, form, standings };
    },
    refetchInterval: (q) => (q.state.data && ["Finished", "Scheduled"].includes(q.state.data.details.fixture.status) ? false : 30_000),
  });
}
