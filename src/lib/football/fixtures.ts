/**
 * Football fixtures from the backend (`/api/football/fixtures`, `/fixtures/live`),
 * parsed with Zod and adapted to the `Match` the lists already draw.
 */
import { z } from "zod";

import type { Match } from "@/lib/mock-data";

const n = z.coerce.number();
const Team = z.object({ id: n, name: z.string(), code: z.string().nullish() });

export const Fixture = z.object({
  id: z.string(),
  competition: z.object({ id: n, name: z.string(), country: z.string().nullish(), countryCode: z.string().nullish() }),
  homeTeam: Team,
  awayTeam: Team,
  kickoffUtc: z.string(),
  status: z.string(),
  score: z.object({ home: n, away: n }).nullish(),
  elapsed: n.nullish(),
  season: n.nullish(),
});
export const Fixtures = z.array(Fixture);
export type Fixture = z.infer<typeof Fixture>;

const LIVE = new Set(["FirstHalf", "HalfTime", "SecondHalf", "ExtraTime", "Penalties", "InPlay"]);

/** `YYYY-MM-DD` of an instant in the viewer's time zone. */
export const dateKey = (d: Date) => d.toLocaleDateString("en-CA");

const DAY = 86_400_000;
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / DAY);

const code = (t: z.infer<typeof Team>) => (t.code ?? t.name.slice(0, 3)).toUpperCase();

/** `today` is the viewer's local date key; `dayOffset` and the kickoff clock are in their time zone. */
export function toMatch(f: Fixture, today: string): Match {
  const status: Match["status"] = f.status === "Finished" ? "finished" : LIVE.has(f.status) ? "live" : "upcoming";
  const at = new Date(f.kickoffUtc);
  return {
    id: f.id,
    home: { code: code(f.homeTeam), name: f.homeTeam.name },
    away: { code: code(f.awayTeam), name: f.awayTeam.name },
    status,
    minute: status === "live" ? (f.elapsed ?? undefined) : undefined,
    score: f.score && status !== "upcoming" ? [f.score.home, f.score.away] : undefined,
    kickoff: at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    dayOffset: daysBetween(dateKey(at), today),
    today,
    kickoffAt: f.kickoffUtc,
    caption: f.competition.name,
    competition: f.competition.name,
    competitionMeta: f.competition.country ? { country: f.competition.country, code: f.competition.countryCode ?? "" } : undefined,
  };
}
