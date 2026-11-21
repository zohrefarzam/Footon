"use client";

/**
 * Your weekly division and friends' leagues from the leaderboard service
 * (`/divisions/me`, `/divisions/me/table`, `/friends-leagues`), adapted to the
 * `Division` the leaderboard already draws. Points only.
 */
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import type { Division } from "@/components/footon/division-card";
import type { FriendsLeague } from "@/components/footon/leaderboard-board";
import { getJson } from "@/lib/api/get";
import { formatNumber, matchup } from "@/lib/format";

const n = z.coerce.number();

const Me = z.object({
  week: z.string(),
  endsAtUtc: z.string(),
  division: z.string(),
  rank: n.nullish(),
  of: n,
  points: n,
  toPromotion: n,
  promoteCount: n,
  relegateCount: n,
});
const Table = z.array(
  z.object({
    rank: n,
    user: z.object({ id: z.string(), name: z.string(), initial: z.string() }),
    movement: n,
    right: n,
    calls: n,
    points: n,
    you: z.boolean(),
  }),
);
const Leagues = z.array(
  z.object({ poolId: z.string(), name: z.string(), players: n, myRank: n.nullish(), final: z.boolean(), match: z.object({ homeTeam: z.object({ name: z.string() }), awayTeam: z.object({ name: z.string() }) }).nullish() }),
);

const NAMES: Record<string, string> = { bronze: "برنزی", silver: "نقره‌ای", gold: "طلایی", platinum: "پلاتینی", diamond: "الماسی" };

const endsIn = (iso: string) => {
  const hours = Math.max(0, Math.round((Date.parse(iso) - Date.now()) / 3_600_000));
  return hours >= 24 ? `${formatNumber(Math.ceil(hours / 24))} روز` : `${formatNumber(hours)} ساعت`;
};

export type LiveLeaderboard = { division: Division; need: number; leagues: FriendsLeague[] };

export const useLeaderboard = () =>
  useQuery({
    queryKey: ["leaderboard", "me"],
    queryFn: async (): Promise<LiveLeaderboard> => {
      const [me, table, leagues] = await Promise.all([
        getJson("leaderboard/divisions/me", Me),
        getJson("leaderboard/divisions/me/table", Table),
        getJson("leaderboard/friends-leagues", Leagues).catch(() => []),
      ]);
      return {
        need: me.toPromotion,
        division: {
          name: NAMES[me.division.toLowerCase()] ?? me.division,
          week: Number(/(\d+)\D*$/.exec(me.week)?.[1] ?? 0),
          endsIn: endsIn(me.endsAtUtc),
          size: me.of,
          promote: me.promoteCount,
          relegate: me.relegateCount,
          rows: table.map((r) => ({ rank: r.rank, name: r.user.name, initial: r.user.initial, points: r.points, right: r.right, calls: r.calls, delta: r.movement, ...(r.you ? { you: true } : {}) })),
        },
        leagues: leagues.map((l) => ({
          id: l.poolId,
          name: l.name,
          sub: `${formatNumber(l.players)} بازیکن${l.final ? " • جدول نهایی" : l.match ? ` • ${matchup(l.match.homeTeam.name, l.match.awayTeam.name)}` : ""}`,
          ...(l.myRank && l.myRank > 0 ? { rank: l.myRank, won: l.final && l.myRank === 1 } : {}),
        })),
      };
    },
  });
