/**
 * One match from the backend (details, statistics, lineups, head-to-head, form,
 * standings), adapted onto the `Match` the match page already draws.
 */
import { z } from "zod";

import type { Lineup, Match, MatchEvent, MatchPreview, MatchStat, TableRow } from "@/lib/mock-data";
import { Fixture, toMatch } from "./fixtures";

const n = z.coerce.number();
const side = (s: string) => (s === "Home" ? "home" : "away") as "home" | "away";

export const FixtureDetails = z.object({
  fixture: Fixture,
  referee: z.string().nullish(),
  venue: z.object({ name: z.string(), city: z.string().nullish(), capacity: n.nullish(), surface: z.string().nullish() }).nullish(),
  events: z.array(
    z.object({
      minute: n,
      side: z.string(),
      type: z.string(),
      player: z.string().nullish(),
      relatedPlayer: z.string().nullish(),
      detail: z.string().nullish(),
    }),
  ),
});

export const Statistics = z.array(z.object({ type: z.string(), home: z.union([z.number(), z.string()]).nullish(), away: z.union([z.number(), z.string()]).nullish() }));

const LineupSide = z
  .object({ formation: z.string().nullish(), startingXI: z.array(z.object({ name: z.string(), number: n.nullish(), position: z.string().nullish() })) })
  .nullish();
export const Lineups = z.object({ home: LineupSide, away: LineupSide });

export const H2H = z.object({ homeTeamWins: n, draws: n, awayTeamWins: n });
export const FormRes = z.object({ home: z.array(z.string()), away: z.array(z.string()) });
export const Standings = z.object({
  rows: z.array(z.object({ rank: n, team: z.object({ code: z.string().nullish(), name: z.string() }), played: n, goalDifference: n, points: n })),
});

const KIND: Record<string, MatchEvent["kind"] | undefined> = {
  Goal: "goal",
  OwnGoal: "goal",
  PenaltyGoal: "goal",
  YellowCard: "yellow",
  SecondYellowCard: "red",
  RedCard: "red",
  Substitution: "sub",
  Var: "var",
};

const STAT_LABEL: Record<string, string> = {
  "Ball Possession": "مالکیت توپ",
  "Total Shots": "شوت",
  "Shots on Goal": "شوت در چارچوب",
  "Corner Kicks": "کرنر",
  Fouls: "خطا",
  Offsides: "آفساید",
  "Yellow Cards": "کارت زرد",
  "Red Cards": "کارت قرمز",
};

const num = (v: string | number | null | undefined) => (typeof v === "number" ? v : Number.parseFloat(v ?? "") || 0);
const FORM: Record<string, "W" | "D" | "L"> = { Win: "W", Draw: "D", Loss: "L" };

export type MatchBundle = {
  details: z.infer<typeof FixtureDetails>;
  stats?: z.infer<typeof Statistics>;
  lineups?: z.infer<typeof Lineups>;
  h2h?: z.infer<typeof H2H>;
  form?: z.infer<typeof FormRes>;
  standings?: z.infer<typeof Standings>;
};

const lineup = (l: z.infer<typeof LineupSide>): Lineup | undefined =>
  l?.formation && l.startingXI.length ? { formation: l.formation, players: l.startingXI.map((p) => ({ number: p.number ?? 0, name: p.name, pos: p.position ?? "" })) } : undefined;

/** Rows within two places of either team: the table "around the match". */
function around(rows: z.infer<typeof Standings>["rows"], codes: string[]): TableRow[] {
  const at = rows.filter((r) => codes.includes((r.team.code ?? r.team.name.slice(0, 3)).toUpperCase())).map((r) => r.rank);
  return rows
    .filter((r) => at.some((a) => Math.abs(a - r.rank) <= 2))
    .map((r) => ({ pos: r.rank, code: (r.team.code ?? r.team.name.slice(0, 3)).toUpperCase(), played: r.played, gd: r.goalDifference, points: r.points }));
}

export function toMatchPage(b: MatchBundle, today: string): Match {
  const m = toMatch(b.details.fixture, today);
  const events: MatchEvent[] = b.details.events.flatMap((e) => {
    const kind = KIND[e.type];
    return kind ? [{ minute: e.minute, side: side(e.side), player: e.player ?? "", kind, detail: kind === "sub" ? (e.relatedPlayer ?? undefined) : kind === "var" ? (e.detail ?? undefined) : undefined }] : [];
  });
  const stats: MatchStat[] | undefined = b.stats
    ?.filter((s) => STAT_LABEL[s.type])
    .map((s) => ({ label: STAT_LABEL[s.type], home: num(s.home), away: num(s.away), ...(typeof s.home === "string" && s.home.endsWith("%") ? { unit: "%" } : {}) }));
  const home = lineup(b.lineups?.home);
  const away = lineup(b.lineups?.away);
  const v = b.details.venue;
  const preview: MatchPreview | undefined =
    v || b.form
      ? {
          venue: { name: v?.name ?? "", city: v?.city ?? "", capacity: v?.capacity ?? 0, surface: v?.surface ?? "" },
          weather: { tempC: 0, sky: "" },
          referee: b.details.referee ?? "",
          tv: [],
          form: { home: (b.form?.home ?? []).map((r) => FORM[r]).filter(Boolean), away: (b.form?.away ?? []).map((r) => FORM[r]).filter(Boolean) },
        }
      : undefined;
  return {
    ...m,
    events,
    stats: stats?.length ? stats : undefined,
    lineups: home && away ? { home, away } : undefined,
    h2h: b.h2h ? { won: b.h2h.homeTeamWins, drawn: b.h2h.draws, lost: b.h2h.awayTeamWins } : undefined,
    table: b.standings ? around(b.standings.rows, [m.home.code, m.away.code]) : undefined,
    preview,
  };
}
