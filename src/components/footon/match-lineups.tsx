import type { Lineup, MatchEvent, Player, Team } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Football } from "./football";
import { TeamCrest } from "./team-crest";
import { formatNumber } from "@/lib/format";

const posName: Record<string, string> = {
  GK: "دروازه‌بان",
  RB: "دفاع راست",
  CB: "دفاع میانی",
  LB: "دفاع چپ",
  CM: "هافبک",
  DM: "هافبک دفاعی",
  AM: "هافبک هجومی",
  RW: "وینگر راست",
  LW: "وینگر چپ",
  ST: "مهاجم",
};

/** Black or white text on a shirt colour, whichever reads. */
function ink(hex = "#2e4b3f") {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#09090b" : "#fafafa";
}

/** Formation → rows of players, keeper first: "4-3-3" → [1, 4, 3, 3]. */
function rows(lineup: Lineup) {
  const sizes = [1, ...lineup.formation.split("-").map(Number)];
  let i = 0;
  return sizes.map((n) => lineup.players.slice(i, (i += n)));
}

function Token({ p, team, events, x, y }: { p: Player; team: Team; events: MatchEvent[]; x: number; y: number }) {
  const mine = events.filter((e) => e.player === p.name);
  const goals = mine.filter((e) => e.kind === "goal");
  const card = mine.find((e) => e.kind === "red") ?? mine.find((e) => e.kind === "yellow");
  const [shirt, trim] = team.colors ?? ["#2e4b3f", "#9db1a6"];

  const label = [
    `${formatNumber(p.number)}، ${p.name}، ${posName[p.pos] ?? p.pos}`,
    ...goals.map((g) => `گل دقیقهٔ ${formatNumber(g.minute)}`),
    card ? `کارت ${card.kind === "red" ? "قرمز" : "زرد"} دقیقهٔ ${formatNumber(card.minute)}` : "",
  ]
    .filter(Boolean)
    .join("، ");

  return (
    <li
      aria-label={label}
      className="absolute flex w-[4.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 max-[359px]:w-[3.75rem]"
      // a pitch is physical: positions use left, never the reading direction (a right back stays on his right)
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span aria-hidden="true" className="relative">
        <span
          className="flex size-9 items-center justify-center rounded-full border-2 font-display text-[15px] font-bold shadow-[0_2px_8px_rgb(0_0_0/0.45)]"
          style={{ background: shirt, borderColor: trim, color: ink(shirt) }}
        >
          {formatNumber(p.number)}
        </span>
        {goals.length > 0 && (
          <span className="absolute -end-1.5 -top-1 flex items-center rounded-full bg-background p-px">
            <Football className="size-3.5" />
            {goals.length > 1 && <span className="px-0.5 font-display text-[11px] font-bold">{formatNumber(goals.length)}</span>}
          </span>
        )}
        {card && (
          <span
            className={cn(
              "absolute -start-1 -top-0.5 h-3 w-2 rounded-[2px] ring-2 ring-pitch",
              card.kind === "red" ? "bg-booking-red" : "bg-booking-yellow",
            )}
          />
        )}
      </span>
      <span aria-hidden="true" className="max-w-full truncate rounded-[6px] bg-black/50 px-1.5 py-px text-[11px] font-semibold text-[#e1ebe5]">
        {p.name}
      </span>
    </li>
  );
}

/** One side's eleven on its half. `top` = attacking down (home); otherwise attacking up. */
function Side({ team, lineup, events, top }: { team: Team; lineup: Lineup; events: MatchEvent[]; top: boolean }) {
  const lines = rows(lineup);
  return (
    <ol aria-label={`${team.name}, ${lineup.formation}`}>
      {lines.flatMap((line, r) => {
        // keeper near the goal line, the rest spread to just short of halfway
        const depth = 7 + (r * 36) / (lines.length - 1);
        const y = top ? depth : 100 - depth;
        // facing down, a team's right is the viewer's left; facing up, it's the viewer's right
        const ordered = top ? line : line.toReversed();
        return ordered.map((p, j) => (
          <Token key={p.number} p={p} team={team} events={events} x={4 + ((j + 0.5) * 92) / line.length} y={y} />
        ));
      })}
    </ol>
  );
}

function TeamTag({ team, formation, className }: { team: Team; formation: string; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("absolute inset-x-0 flex items-center gap-2 px-4", className)}>
      <TeamCrest code={team.code} colors={team.colors} size="xs" />
      <span className="text-[13px] font-semibold text-[#e1ebe5]">{team.name}</span>
      <span className="ms-auto font-display text-[15px] font-bold text-white/60">{formation}</span>
    </div>
  );
}

/**
 * Both starting XIs on one pitch (the FotMob view): home in the top half
 * attacking down, away in the bottom half attacking up. Each player is a disc
 * in their shirt colours with the number in display font and the name
 * under it; goals (ball) and bookings (card glyph) sit on the disc.
 */
export function MatchLineups({
  home,
  away,
  lineups,
  events = [],
}: {
  home: Team;
  away: Team;
  lineups: { home: Lineup; away: Lineup };
  events?: MatchEvent[];
}) {
  return (
    <section
      aria-label="ترکیب اصلی دو تیم"
      className="relative -mx-1 overflow-hidden rounded-2xl border border-[#1c2a1f] bg-[repeating-linear-gradient(180deg,var(--pitch)_0_9%,var(--pitch-2)_9%_18%)]"
    >
      <TeamTag team={home} formation={lineups.home.formation} className="top-0 h-10 border-b border-pitch-line bg-black/25" />

      <div className="relative mx-3 my-12 h-[600px]">
        {/* markings */}
        <div aria-hidden="true" className="absolute inset-0 rounded-sm border-[1.5px] border-pitch-line" />
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t-[1.5px] border-pitch-line" />
        <div aria-hidden="true" className="absolute top-1/2 left-1/2 aspect-square w-[26%] -translate-1/2 rounded-full border-[1.5px] border-pitch-line" />
        <div aria-hidden="true" className="absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full bg-pitch-line" />
        {(["top-0 border-t-0", "bottom-0 border-b-0"] as const).map((edge) => (
          <div key={edge} aria-hidden="true">
            <div className={cn("absolute left-1/2 h-[14%] w-[56%] -translate-x-1/2 border-[1.5px] border-pitch-line", edge)} />
            <div className={cn("absolute left-1/2 h-[5.5%] w-[26%] -translate-x-1/2 border-[1.5px] border-pitch-line", edge)} />
          </div>
        ))}

        <Side team={home} lineup={lineups.home} events={events} top />
        <Side team={away} lineup={lineups.away} events={events} top={false} />
      </div>

      <TeamTag team={away} formation={lineups.away.formation} className="bottom-0 h-10 border-t border-pitch-line bg-black/25" />
    </section>
  );
}
