import { ChevronDown, ChevronUp } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Standing } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const MEDALS: Record<number, { className: string; label: string }> = {
  1: { className: "bg-gold text-gold-foreground", label: "gold" },
  2: { className: "bg-silver text-background", label: "silver" },
  3: { className: "bg-bronze text-background", label: "bronze" },
};

/** Position: a medal disc for the top three, a plain display number below. */
export function RankCell({ rank, className }: { rank: number; className?: string }) {
  const medal = MEDALS[rank];
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full font-display text-[15px] leading-none font-bold tabular-nums",
        medal ? medal.className : "text-muted-foreground",
        className,
      )}
    >
      {rank}
    </span>
  );
}

/** Places moved since the last update: chevron up / down (shape and colour), or nothing. */
export function RankMove({ delta = 0 }: { delta?: number }) {
  if (!delta) return <span className="sr-only">no change</span>;
  const up = delta > 0;
  const Icon = up ? ChevronUp : ChevronDown;
  return (
    <span className={cn("inline-flex items-center font-display text-[11px] leading-none font-bold", up ? "text-primary" : "text-loss")}>
      <Icon className="size-3.5" strokeWidth={3} aria-hidden="true" />
      <span aria-hidden="true">{Math.abs(delta)}</span>
      <span className="sr-only">{up ? `up ${delta}` : `down ${-delta}`}</span>
    </span>
  );
}

/**
 * A football-table leaderboard: position (medals for the top three), movement,
 * player, calls right and points. Your row is soft-lime. `zones` draws the
 * promotion / drop lines of a division; rows with a fixed `rank` that skip
 * places get a gap row, so a long table can show its top, you, and its bottom.
 * `compact` drops the calls column and tightens rows for cards on Home.
 */
export function Standings({
  rows,
  caption,
  zones,
  compact = false,
  className,
}: {
  rows: Standing[];
  caption: string;
  zones?: { promote?: number; relegate?: number; size: number };
  compact?: boolean;
  className?: string;
}) {
  const ranked = rows.map((r, i) => ({ ...r, rank: r.rank ?? i + 1 }));
  const showCalls = !compact && ranked.some((r) => r.right !== undefined);
  const cols = showCalls ? 5 : 4;
  const dropFrom = zones?.relegate ? zones.size - zones.relegate + 1 : undefined;

  const zoneRow = (key: string, label: string, tone: "up" | "down") => (
    <tr key={key} aria-hidden="true">
      <td colSpan={cols} className="p-0">
        <div className={cn("flex items-center gap-2 px-4 py-1", tone === "up" ? "text-primary" : "text-loss")}>
          <span className="h-px flex-1 border-t border-dashed border-current opacity-50" />
          <span className="flex items-center gap-0.5 text-[11px] font-semibold tracking-[0.08em] uppercase">
            {tone === "up" ? <ChevronUp className="size-3.5" strokeWidth={3} /> : <ChevronDown className="size-3.5" strokeWidth={3} />}
            {label}
          </span>
        </div>
      </td>
    </tr>
  );

  const body: React.ReactNode[] = [];
  ranked.forEach((r, i) => {
    const prev = ranked[i - 1];
    if (dropFrom && r.rank >= dropFrom && (!prev || prev.rank < dropFrom)) body.push(zoneRow(`drop-${r.rank}`, "Drop zone", "down"));
    else if (prev && r.rank - prev.rank > 1)
      body.push(
        <tr key={`gap-${r.rank}`} aria-hidden="true">
          <td colSpan={cols} className="py-0.5 text-center font-display text-sm leading-none text-subtle">
            ···
          </td>
        </tr>,
      );

    body.push(
      <tr
        key={r.rank}
        aria-current={r.you ? "true" : undefined}
        className={cn("border-line [&:not(:first-child)]:border-t", r.you && "bg-primary-soft")}
      >
        <td className={cn("ps-3", compact ? "py-2" : "py-2.5")}>
          <RankCell rank={r.rank} />
        </td>
        <td className="w-full min-w-0 py-1.5 ps-1">
          <span className="flex min-w-0 items-center gap-2.5">
            <Avatar className={compact ? "size-7" : "size-8"}>
              <AvatarFallback className={cn(r.you && "bg-primary text-primary-foreground")}>{r.initial}</AvatarFallback>
            </Avatar>
            <span className={cn("min-w-0 truncate text-[15px] font-semibold", r.you && "text-primary")}>{r.name}</span>
            <RankMove delta={r.delta} />
          </span>
        </td>
        {showCalls && (
          <td className="px-2 text-end whitespace-nowrap">
            <span className="font-display text-[15px] font-bold tabular-nums">{r.right ?? "–"}</span>
            {r.calls !== undefined && <span className="font-display text-xs text-muted-foreground">/{r.calls}</span>}
          </td>
        )}
        <td className={cn("pe-4 text-end font-display text-lg font-bold tabular-nums", r.you && "text-primary")}>{r.points.toLocaleString("en-US")}</td>
      </tr>,
    );

    if (zones?.promote && r.rank === zones.promote && ranked[i + 1]) body.push(zoneRow(`up-${r.rank}`, "Promotion", "up"));
  });

  return (
    <table className={cn("w-full border-collapse", className)}>
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          <th scope="col" className="ps-3 pt-3 pb-1.5 text-start font-semibold">
            <span className="inline-block w-7 text-center">#</span>
          </th>
          <th scope="col" className="ps-1 pt-3 pb-1.5 text-start font-semibold">
            Player
          </th>
          {showCalls && (
            <th scope="col" className="px-2 pt-3 pb-1.5 text-end font-semibold">
              <abbr title="Calls right of calls made" className="no-underline">
                Right
              </abbr>
            </th>
          )}
          <th scope="col" className="pe-4 pt-3 pb-1.5 text-end font-semibold">
            Pts
          </th>
        </tr>
      </thead>
      <tbody>{body}</tbody>
    </table>
  );
}
