"use client";

/**
 * Friends' challenges from the predictions service (`/challenges`,
 * `/challenges/invites`, `/challenges/{id}/join`), adapted to the `Challenge`
 * the lists already draw. Status is worked out from what the server sends:
 * you're in → joined (finished once settled); not in and the match hasn't
 * started → invited; otherwise expired.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { getJson } from "@/lib/api/get";
import { ApiError } from "@/lib/gamification/api/client";
import type { ChallengeWithMatch } from "@/lib/challenges";
import type { Challenge, Invite } from "@/lib/mock-data";
import type { InviteWithMatch } from "@/components/footon/invite-strip";
import { toServiceMatch } from "./match";

const n = z.coerce.number();
const Person = z.object({ userId: z.string(), name: z.string(), initial: z.string() });

const Card = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  entry: n,
  members: z.array(Person),
  mine: z.boolean(),
  joined: z.boolean(),
  myRank: n.nullish(),
  boost: n.nullish(),
  invitedBy: Person.nullish(),
  inviteCode: z.string().nullish(),
  inviteLink: z.string().nullish(),
  rules: z.object({ stake: z.string(), fixed: n.nullish(), cap: n.nullish() }),
  match: z.object({
    id: z.string(),
    homeTeam: z.object({ name: z.string() }),
    awayTeam: z.object({ name: z.string() }),
    status: z.string(),
    kickoffUtc: z.string(),
    homeGoals: n.nullish(),
    awayGoals: n.nullish(),
  }),
});
export type Card = z.infer<typeof Card>;

const List = z.array(Card);
const Detail = z.object({
  challenge: Card,
  standings: z.array(z.object({ userId: z.string(), name: z.string(), initial: z.string(), rank: n, points: n, right: n, calls: n, you: z.boolean() })),
});
const Invites = z.object({ count: n, items: List });

export function toChallenge(c: Card, today: string): ChallengeWithMatch {
  const match = toServiceMatch(c.match, today, !!c.boost && c.boost > 1);
  const status: Challenge["status"] = c.joined
    ? c.status === "Settled"
      ? "finished"
      : c.status === "Cancelled"
        ? "expired"
        : "joined"
    : c.status === "Open" && match.status === "upcoming"
      ? "invited"
      : "expired";
  return {
    id: c.id,
    name: c.name,
    matchId: c.match.id,
    entry: c.entry,
    members: c.members.map((p) => p.initial),
    status,
    rules: { stake: c.rules.stake === "fixed" && c.rules.fixed ? { fixed: c.rules.fixed } : "free", ...(c.rules.cap ? { cap: c.rules.cap } : {}) },
    ...(c.invitedBy ? { from: { name: c.invitedBy.name, initial: c.invitedBy.initial } } : {}),
    ...(c.mine ? { mine: true } : {}),
    ...(c.myRank && c.myRank > 0 ? { rank: c.myRank } : {}),
    match,
  };
}

export const toInvite = (c: ChallengeWithMatch): InviteWithMatch => {
  const inv: Invite = { id: c.id, from: c.from?.name ?? "", initial: c.from?.initial ?? "", league: c.name, entry: c.entry, members: c.members, matchId: c.matchId, rules: c.rules };
  return { ...inv, match: c.match };
};

/** Every challenge you're part of or invited to, newest data first. `today` is the viewer's local date key. */
export function useChallenges(today: string | null) {
  const list = useQuery({ queryKey: ["challenges", "list"], queryFn: () => getJson("predictions/challenges", List), enabled: !!today });
  const invites = useQuery({ queryKey: ["challenges", "invites"], queryFn: () => getJson("predictions/challenges/invites", Invites), enabled: !!today });
  const loading = !today || list.isPending || invites.isPending;
  const error = list.isError && invites.isError;
  const byId = new Map<string, Card>();
  for (const c of [...(list.data ?? []), ...(invites.data?.items ?? [])]) byId.set(c.id, c);
  const all = today ? [...byId.values()].map((c) => toChallenge(c, today)) : [];
  return { all, invites: all.filter((c) => c.status === "invited"), loading, error };
}

/** Joining resolves true once the server has you in; the lists refresh behind it. */
export function useJoinChallenge() {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/predictions/challenges/${id}/join`, { method: "POST" });
      if (!res.ok) throw new ApiError(res.status === 401 ? "unauthorized" : res.status === 402 ? "insufficient_balance" : "server", `HTTP ${res.status}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });
  return (id: string) => m.mutateAsync(id).then(() => true, () => false);
}

/** The share link without its scheme (the ticket and `https://${link}` add it back). */
export const linkOf = (c: Pick<Card, "inviteLink">) => (c.inviteLink ?? "").replace(/^https?:\/\//, "");

export type ChallengeDetail = { card: Card; standings: z.infer<typeof Detail>["standings"] };

export const useChallengeDetail = (id: string) =>
  useQuery({
    queryKey: ["challenges", "detail", id],
    queryFn: async (): Promise<ChallengeDetail> => {
      const d = await getJson(`predictions/challenges/${id}`, Detail);
      return { card: d.challenge, standings: d.standings };
    },
  });

export type NewChallenge = { matchId: string; name: string; entry: number; fixedStake: number | null; cap: number | null };

/** Creates a challenge; resolves with it (id, invite code and link) or null when the server said no. */
export function useCreateChallenge() {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async (body: NewChallenge) => {
      const res = await fetch("/api/predictions/challenges", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new ApiError(res.status === 402 ? "insufficient_balance" : "server", `HTTP ${res.status}`);
      return Detail.parse(await res.json()).challenge;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });
  return (body: NewChallenge) => m.mutateAsync(body).then((c) => ({ id: c.id, code: c.inviteCode ?? "", link: linkOf(c) }), () => null);
}

const Messages = z.object({
  items: z.array(z.object({ id: z.coerce.string(), user: Person, text: z.string(), sentAt: z.string() })),
});

/** The challenge's chat, oldest first. Polled, so a friend's message shows up within a few seconds. */
export const useChallengeMessages = (id: string) =>
  useQuery({
    queryKey: ["challenges", "messages", id],
    queryFn: async () => (await getJson(`predictions/challenges/${id}/messages?limit=50`, Messages)).items.toSorted((a, b) => a.sentAt.localeCompare(b.sentAt)),
    refetchInterval: 6_000,
  });

/** Sends a message; resolves true once the server has it. */
export function useSendMessage(id: string) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/predictions/challenges/${id}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) });
      if (!res.ok) throw new ApiError("server", `HTTP ${res.status}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges", "messages", id] }),
  });
  return (text: string) => m.mutateAsync(text).then(() => true, () => false);
}

/** Looks a challenge up by its invite code, so you can see what you're joining. Throws when there is none. */
export async function lookupChallenge(code: string, today: string): Promise<ChallengeWithMatch> {
  return toChallenge(await getJson(`predictions/challenges/code/${encodeURIComponent(code)}`, Card), today);
}

/** Joins by code; resolves with the challenge id, or null when the server said no. */
export function useJoinByCode() {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch("/api/predictions/challenges/join", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
      if (!res.ok) throw new ApiError(res.status === 402 ? "insufficient_balance" : "server", `HTTP ${res.status}`);
      return Detail.parse(await res.json()).challenge.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["challenges"] }),
  });
  return (code: string) => m.mutateAsync(code).then((id) => id, () => null);
}
