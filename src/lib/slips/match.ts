import { dayLabel } from "@/lib/dates";
import { dateKey } from "@/lib/football/fixtures";
import type { Match } from "@/lib/mock-data";

const DAY = 86_400_000;
const code = (name: string) => name.slice(0, 3).toUpperCase();

/** A match as the predictions service describes it (open matches, challenges, your predictions), as the `Match` the lists draw. */
export type ServiceMatch = {
  id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  kickoffUtc: string;
  status: string;
  homeGoals?: number | null;
  awayGoals?: number | null;
};

export function toServiceMatch(m: ServiceMatch, today: string, boost = false): Match {
  const at = new Date(m.kickoffUtc);
  const offset = Math.round((Date.parse(`${dateKey(at)}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY);
  const status: Match["status"] = m.status === "Finished" ? "finished" : m.status === "Live" ? "live" : "upcoming";
  return {
    id: m.id,
    home: { code: code(m.homeTeam.name), name: m.homeTeam.name },
    away: { code: code(m.awayTeam.name), name: m.awayTeam.name },
    status,
    score: status === "upcoming" || m.homeGoals == null || m.awayGoals == null ? undefined : [m.homeGoals, m.awayGoals],
    kickoff: at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    day: offset === 0 ? undefined : dayLabel(offset, today),
    caption: "",
    competition: "",
    ...(boost ? { boost: 2 as const } : {}),
  };
}
