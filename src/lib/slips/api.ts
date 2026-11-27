"use client";

/**
 * A player's slip and the crowd poll for one match, from the predictions
 * service (`/matches/{id}/slip`, `/matches/{id}/crowd`). The backend's markets
 * line up one-to-one with the UI's prediction types; picks use the UI's own
 * strings ("2-1", "1" / "X" / "2", "Over 2.5", "Yes").
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { getJson } from "@/lib/api/get";
import { ApiError } from "@/lib/gamification/api/client";
import { newIdempotencyKey } from "@/lib/gamification/outbox";
import type { Prediction, PredictionType } from "@/lib/predictions";

const n = z.coerce.number();

const MARKET: Record<string, PredictionType> = {
  Score: "score",
  Result: "result",
  Goals: "goals",
  Corners: "corners",
  Yellows: "yellows",
  Red: "red",
  Penalty: "penalty",
};
const MARKET_OF = Object.fromEntries(Object.entries(MARKET).map(([k, v]) => [v, k]));

const Slip = z.object({
  editable: z.boolean(),
  picks: z.array(z.object({ market: z.string(), pick: z.string(), stake: n, result: z.string() })),
});

export const Crowd = z.object({
  home: n,
  draw: n,
  away: n,
  votes: n,
  topScore: z.array(n).nullish(),
  myPick: z.string().nullish(),
});
export type Crowd = z.infer<typeof Crowd>;

export type SlipData = { editable: boolean; picks: Prediction[] };

const toPredictions = (s: z.infer<typeof Slip>): SlipData => ({
  editable: s.editable,
  picks: s.picks.flatMap((p) => {
    const type = MARKET[p.market];
    return type ? [{ id: p.market, type, pick: p.pick, stake: p.stake, ...(p.result === "Won" ? { result: "right" as const } : p.result === "Lost" ? { result: "wrong" as const } : {}) }] : [];
  }),
});

const slipKey = (id: string) => ["slip", id] as const;

export const useSlip = (matchId: string) =>
  useQuery({
    queryKey: slipKey(matchId),
    queryFn: async () => toPredictions(await getJson(`predictions/matches/${matchId}/slip`, Slip)),
  });

/** Saves the whole slip (it replaces the old one). Resolves true when the server has it. */
export function useSaveSlip(matchId: string) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async (items: Prediction[]) => {
      const res = await fetch(`/api/predictions/matches/${matchId}/slip`, {
        method: "PUT",
        headers: { "content-type": "application/json", "idempotency-key": newIdempotencyKey(`slip_${matchId}`) },
        body: JSON.stringify({ picks: items.map((p) => ({ market: MARKET_OF[p.type], pick: p.pick, stake: p.stake })) }),
      });
      if (!res.ok) throw new ApiError(res.status === 401 ? "unauthorized" : "server", `HTTP ${res.status}`);
      return toPredictions(Slip.parse(await res.json()));
    },
    onSuccess: (data) => qc.setQueryData(slipKey(matchId), data),
  });
  return (items: Prediction[]) => m.mutateAsync(items).then(() => true, () => false);
}

/** Matches where you have your own open slip (picks, not yet settled). */
export function useSoloMatchIds(enabled = true) {
  const { data } = useMyPredictions(enabled);
  return new Set(data?.items.filter((i) => i.picks.length > 0 && i.match.status !== "Finished").map((i) => i.match.id));
}

/** Empties your slip on a match (the PUT replaces it), so a challenge can take the match. Resolves true when the server did it. */
export function useClearSlip() {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async (matchId: string) => {
      const res = await fetch(`/api/predictions/matches/${matchId}/slip`, {
        method: "PUT",
        headers: { "content-type": "application/json", "idempotency-key": newIdempotencyKey(`slip_${matchId}`) },
        body: JSON.stringify({ picks: [] }),
      });
      if (!res.ok) throw new ApiError(res.status === 401 ? "unauthorized" : "server", `HTTP ${res.status}`);
      return matchId;
    },
    onSuccess: (id) => Promise.all([qc.invalidateQueries({ queryKey: slipKey(id) }), qc.invalidateQueries({ queryKey: ["predictions", "me"] })]),
  });
  return (matchId: string) => m.mutateAsync(matchId).then(() => true, () => false);
}

export const useCrowd = (matchId: string) => useQuery({ queryKey: ["crowd", matchId], queryFn: () => getJson(`predictions/matches/${matchId}/crowd`, Crowd) });

const PICK = { home: "Home", draw: "Draw", away: "Away" } as const;
export function useVote(matchId: string) {
  const qc = useQueryClient();
  return (pick: keyof typeof PICK) =>
    fetch(`/api/predictions/matches/${matchId}/crowd`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pick: PICK[pick] }),
    })
      .then(() => qc.invalidateQueries({ queryKey: ["crowd", matchId] }))
      .catch(() => {});
}

const TEAM = z.object({ id: n, name: z.string() });
const MyPredictions = z.object({
  summary: z.object({ openPicks: n, staked: n, couldWin: n }),
  items: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
      match: z.object({ id: z.string(), homeTeam: TEAM, awayTeam: TEAM, kickoffUtc: z.string(), status: z.string(), homeGoals: n.nullish(), awayGoals: n.nullish() }),
      picks: z.array(z.object({ market: z.string(), pick: z.string(), stake: n, potentialWin: n, result: z.string() })),
    }),
  ),
});
export type MyPredictionsData = z.infer<typeof MyPredictions>;

export const useMyPredictions = (enabled = true) => useQuery({ queryKey: ["predictions", "me"], queryFn: () => getJson("predictions/predictions/me", MyPredictions), enabled });

/** A prediction row's picks as the UI's `Prediction`s, with the server's own win figure. */
export const picksOf = (item: MyPredictionsData["items"][number]): Prediction[] =>
  item.picks.flatMap((p) => {
    const type = MARKET[p.market];
    return type ? [{ id: `${item.id}-${p.market}`, type, pick: p.pick, stake: p.stake, win: p.potentialWin, ...(p.result === "Won" ? { result: "right" as const } : p.result === "Lost" ? { result: "wrong" as const } : {}) }] : [];
  });

const OpenMatches = z.array(
  z.object({ id: z.string(), homeTeam: TEAM, awayTeam: TEAM, kickoffUtc: z.string(), status: z.string() }),
);
const Boost = z.object({ boost: n });

/** Whether a match is a big one (its markets carry a boost): the one markets call `useBigMatches` makes, for a single match. */
export const useIsBig = (matchId: string) =>
  useQuery({ queryKey: ["predictions", "boost", matchId], staleTime: 5 * 60_000, queryFn: () => getJson(`predictions/matches/${matchId}/markets`, Boost).then((b) => b.boost > 1, () => false) });

/** How many of the nearest open matches are checked for a boost (one markets call each). */
const BIG_CHECKED = 10;

/**
 * Tonight's big matches: the nearest open matches whose markets carry a boost.
 * The boost only lives on a match's markets, so each candidate is asked.
 */
export function useBigMatches(today: string | null) {
  return useQuery({
    queryKey: ["predictions", "big", today],
    enabled: !!today,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const open = (await getJson("predictions/matches/open", OpenMatches)).toSorted((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc)).slice(0, BIG_CHECKED);
      const boosts = await Promise.all(open.map((m) => getJson(`predictions/matches/${m.id}/markets`, Boost).then((b) => b.boost > 1, () => false)));
      return open.filter((_, i) => boosts[i]);
    },
  });
}
