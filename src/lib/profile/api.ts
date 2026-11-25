"use client";

/**
 * Profile data from the backend: your recent form (predictions service), the
 * clubs you follow (identity service) and the team directory (football
 * service). Clubs are keyed by team code in the UI; ids are kept here.
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import type { Outcome } from "@/components/footon/form-bars";
import { getJson } from "@/lib/api/get";
import type { Team } from "@/lib/mock-data";

const n = z.coerce.number();

const Form = z.object({
  won: n,
  lost: n,
  void: n,
  items: z.array(z.object({ kickoffUtc: z.string(), result: z.string() })),
});

const outcome = (r: string): Outcome => (/won|right|win/i.test(r) ? "W" : /lost|wrong|loss/i.test(r) ? "L" : "V");

export const useFormStats = () =>
  useQuery({
    queryKey: ["profile", "form"],
    queryFn: async () => {
      const f = await getJson("predictions/users/me/form", Form);
      return { wins: f.won, losses: f.lost, voids: f.void, results: f.items.toSorted((a, b) => a.kickoffUtc.localeCompare(b.kickoffUtc)).map((i) => outcome(i.result)) };
    },
  });

const Teams = z.array(z.object({ id: n, name: z.string(), code: z.string().nullish(), logo: z.string().nullish() }));
const Followed = z.object({ teamIds: z.array(n) });

export type ClubDirectory = { teams: Team[]; idOf: Record<string, number>; followed: string[] };

/** The team directory and the clubs you follow, as team codes. Only the first 500 teams are listed. */
type ApiTeam = z.infer<typeof Teams>[number];

/** Backend teams → UI clubs keyed by team code (first team wins a code). */
function toClubs(teams: ApiTeam[], idOf: Record<string, number> = {}) {
  const list: Team[] = [];
  const ids: Record<string, number> = { ...idOf };
  for (const t of teams) {
    const code = (t.code ?? t.name.slice(0, 3)).toUpperCase();
    if (ids[code] !== undefined) continue;
    ids[code] = t.id;
    list.push({ code, name: t.name, logo: t.logo ?? undefined });
  }
  return { list, ids };
}

export const useClubs = (enabled = true) =>
  useQuery({
    queryKey: ["profile", "clubs"],
    enabled,
    queryFn: async (): Promise<ClubDirectory> => {
      const [teams, followed] = await Promise.all([getJson("football/teams?limit=500", Teams), getJson("identity/users/me/clubs", Followed)]);
      const { list, ids } = toClubs(teams);
      const codeOf = Object.fromEntries(Object.entries(ids).map(([code, id]) => [id, code]));
      return { teams: list, idOf: ids, followed: followed.teamIds.flatMap((id) => (codeOf[id] ? [codeOf[id]] : [])) };
    },
  });

/**
 * Server-side club search (`football/teams?search=`). Pass an already-debounced
 * query. Hits are also merged into the club directory cache so picking one
 * (chip, save) works even when it isn't in the first 500.
 */
export function useClubSearch(query: string) {
  const qc = useQueryClient();
  const q = query.trim();
  return useQuery({
    queryKey: ["profile", "club-search", q.toLowerCase()],
    enabled: q.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<Team[]> => {
      const hits = await getJson(`football/teams?search=${encodeURIComponent(q)}&limit=50`, Teams);
      const { list, ids } = toClubs(hits);
      qc.setQueryData<ClubDirectory>(["profile", "clubs"], (dir) => {
        if (!dir) return dir;
        const known = new Set(dir.teams.map((t) => t.code));
        return { ...dir, teams: [...dir.teams, ...list.filter((t) => !known.has(t.code))], idOf: { ...ids, ...dir.idOf } };
      });
      // a hit whose code was already taken by another team is still shown under its own code
      return hits.flatMap((t) => {
        const code = (t.code ?? t.name.slice(0, 3)).toUpperCase();
        return ids[code] === t.id ? [{ code, name: t.name, logo: t.logo ?? undefined }] : [];
      });
    },
  });
}

/** Saves the clubs you follow (replaces the list). The picker already shows the change; a failure refetches the saved list. */
export function useSaveClubs(idOf: Record<string, number>) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async (codes: string[]) => {
      const res = await fetch("/api/identity/users/me/clubs", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teamIds: codes.flatMap((c) => (idOf[c] !== undefined ? [idOf[c]] : [])) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    },
    onError: () => void qc.invalidateQueries({ queryKey: ["profile", "clubs"] }),
  });
  return (codes: string[]) => void m.mutateAsync(codes).catch(() => {});
}
