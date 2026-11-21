import { LeaderboardBoard } from "@/components/footon/leaderboard-board";
import { LeaderboardLive } from "@/components/footon/leaderboard-live";
import { challengeHref, challengesWithMatch } from "@/lib/challenges";
import { division } from "@/lib/mock-data";
import { formatNumber, matchup } from "@/lib/format";

/** Leaderboard: your weekly division and your friends' leagues. Real data when a backend is set. */
export default function LeaderboardPage() {
  if (process.env.NEXT_PUBLIC_GAMIFICATION_API) return <LeaderboardLive />;
  const leagues = challengesWithMatch()
    .filter((c) => (c.status === "joined" || c.status === "finished") && c.table?.length)
    .map((c) => {
      const i = c.table!.findIndex((r) => r.you);
      return {
        id: c.id,
        name: c.name,
        href: `${challengeHref(c)}#league`,
        sub: `${formatNumber(c.table!.length)} بازیکن • ${c.status === "finished" ? "جدول نهایی" : matchup(c.match.home.code, c.match.away.code)}`,
        rank: i >= 0 ? i + 1 : undefined,
        won: i === 0 && c.status === "finished",
      };
    });
  return <LeaderboardBoard division={division} leagues={leagues} />;
}
