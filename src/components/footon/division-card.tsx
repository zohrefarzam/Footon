import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { Standing } from "@/lib/mock-data";
import { cn, ordinal } from "@/lib/utils";
import { LeagueBadge } from "./league-badge";
import { formatNumber } from "@/lib/format";

export type Division = {
  name: string;
  week: number;
  endsIn: string;
  size: number;
  promote: number;
  relegate: number;
  rows: Standing[];
};

/**
 * Where you sit in the whole division, one tick per place: the promotion zone
 * is lime-tinted at the top, the drop zone is short at the bottom, and your
 * place is the tall tick. Shape carries it, not just colour.
 */
export function RankStrip({ rank, size, promote, relegate, tone = "dark", className }: { rank: number; size: number; promote: number; relegate: number; tone?: "dark" | "light"; className?: string }) {
  const light = tone === "light";
  return (
    <div
      role="img"
      aria-label={`رتبهٔ ${formatNumber(rank)} از ${formatNumber(size)}. ${formatNumber(promote)} نفر اول صعود می‌کنن و ${formatNumber(relegate)} نفر آخر سقوط.`}
      className={cn("grid h-5 items-end gap-[3px]", className)}
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: size }, (_, i) => {
        const place = i + 1;
        const you = place === rank;
        const up = place <= promote;
        const down = place > size - relegate;
        return (
          <span
            key={i}
            className={cn(
              "rounded-[2px]",
              you ? "h-5" : down ? "h-1.5" : "h-3",
              light
                ? you
                  ? "bg-background"
                  : up
                    ? "bg-background/55"
                    : "bg-background/20"
                : you
                  ? "bg-primary"
                  : up
                    ? "bg-primary/35"
                    : down
                      ? "bg-loss/45"
                      : "bg-dim",
            )}
          />
        );
      })}
    </div>
  );
}

/** Points you need to reach the promotion zone (0 = you're in it). */
export function toPromotion(d: Division) {
  const you = d.rows.find((r) => r.you);
  const cutoff = d.rows.find((r) => r.rank === d.promote);
  if (!you || !cutoff) return undefined;
  return (you.rank ?? 0) <= d.promote ? 0 : cutoff.points - you.points + 1;
}

/**
 * Your division at a glance: badge, week, your place in big numbers, the
 * whole table as a rank strip and how far it is to promotion. Links to /leaderboard.
 */
export function DivisionCard({ division: d, className }: { division: Division; className?: string }) {
  const you = d.rows.find((r) => r.you);
  if (!you?.rank) return null;
  const need = toPromotion(d);

  return (
    <Link
      href="/leaderboard"
      className={cn(
        "group flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 outline-none transition-colors hover:bg-surface-hover focus-visible:ring-[3px] focus-visible:ring-ring/60",
        className,
      )}
    >
      <span className="flex items-center gap-3">
        <LeagueBadge name={d.name} tone="silver" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">دستهٔ {d.name}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            هفتهٔ {formatNumber(d.week)} • {d.endsIn} تا پایان
          </span>
        </span>
        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
      </span>
      <span className="flex items-end justify-between gap-3">
        <span className="font-display text-[44px] leading-[0.9] font-bold text-primary">
          {ordinal(you.rank)}
          <span className="ms-1.5 text-xl text-muted-foreground">از {formatNumber(d.size)}</span>
        </span>
        <span className="pb-1 text-end text-[13px] font-semibold">
          {need ? (
            <>
              <span className="font-display text-base font-bold">{formatNumber(need)}</span> امتیاز تا صعود
            </>
          ) : (
            "در منطقهٔ صعود"
          )}
        </span>
      </span>
      <RankStrip rank={you.rank} size={d.size} promote={d.promote} relegate={d.relegate} />
    </Link>
  );
}
