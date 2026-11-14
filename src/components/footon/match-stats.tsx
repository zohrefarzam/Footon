import { Card } from "@/components/ui/card";
import type { MatchStat } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

/**
 * Head-to-head stat rows (FotMob style): value • label • value, with a split bar
 * under each. The side ahead on that stat reads bright, the other dims. Neutral
 * on purpose: being ahead on shots isn't a win, so no lime.
 */
export function MatchStats({ stats, home, away }: { stats: MatchStat[]; home: string; away: string }) {
  return (
    <Card className="overflow-hidden">
      <ul aria-label="آمار بازی">
        {stats.map((st) => {
          const total = st.home + st.away || 1;
          const lead = st.home === st.away ? null : st.home > st.away ? "home" : "away";
          const v = (side: "home" | "away") => (
            <span
              className={cn(
                "font-display text-lg leading-none font-bold tabular-nums",
                lead && lead !== side && "text-muted-foreground",
              )}
            >
              {formatNumber(st[side])}
              {st.unit === "%" ? "٪" : st.unit}
            </span>
          );
          return (
            <li
              key={st.label}
              aria-label={`${st.label}: ${home} ${formatNumber(st.home)}${st.unit ?? ""}، ${away} ${formatNumber(st.away)}${st.unit ?? ""}`}
              className="flex flex-col gap-2 px-4 py-3 [&+&]:border-t [&+&]:border-line"
            >
              <div aria-hidden="true" className="flex items-center justify-between">
                {v("home")}
                <span className="text-[13px] font-medium text-muted-foreground">{st.label}</span>
                {v("away")}
              </div>
              <div aria-hidden="true" className="flex h-1.5 gap-[3px]">
                <span
                  className={cn("rounded-full", lead === "away" ? "bg-dim" : "bg-foreground")}
                  style={{ width: `${(st.home / total) * 100}%` }}
                />
                <span
                  className={cn("rounded-full", lead === "home" ? "bg-dim" : "bg-foreground")}
                  style={{ width: `${(st.away / total) * 100}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
