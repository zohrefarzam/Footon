import { Fragment } from "react";
import { ArrowRightLeft, MonitorPlay } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { MatchEvent } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Football } from "./football";
import { formatMinute, formatNumber, formatScore } from "@/lib/format";

const kindLabel: Record<MatchEvent["kind"], string> = {
  goal: "گل",
  yellow: "کارت زرد",
  red: "کارت قرمز",
  sub: "تعویض",
  var: "VAR",
};

function EventIcon({ kind }: { kind: MatchEvent["kind"] }) {
  if (kind === "goal") return <Football className="size-4" />;
  if (kind === "yellow" || kind === "red")
    return (
      <span
        aria-hidden="true"
        className={cn("h-3.5 w-2.5 shrink-0 rounded-[2px]", kind === "yellow" ? "bg-booking-yellow" : "bg-booking-red")}
      />
    );
  if (kind === "sub") return <ArrowRightLeft className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />;
  return <MonitorPlay className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />;
}

/**
 * Match facts, the FotMob timeline: newest first, the minute in a centre column,
 * home events on the start side and away events on the end side, so you read
 * who did what by position. Goals carry the running score. A half-time rule
 * splits the halves; kick-off closes the list.
 */
export function MatchFacts({
  events,
  minute,
  home,
  away,
  finished = false,
}: {
  events: MatchEvent[];
  minute: number;
  home: string;
  away: string;
  finished?: boolean;
}) {
  // running score after each goal, in match order
  const score: [number, number] = [0, 0];
  const withScore = events
    .toSorted((a, b) => a.minute - b.minute)
    .map((e) => {
      if (e.kind === "goal") score[e.side === "home" ? 0 : 1]++;
      return { ...e, score: e.kind === "goal" ? ([...score] as [number, number]) : undefined };
    })
    .reverse();

  const firstHalfAt = withScore.findIndex((e) => e.minute <= 45);
  const showHT = minute > 45;

  const marker = (label: string) => (
    <li key={label} className="flex items-center gap-3 px-4 py-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      {label}
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </li>
  );

  return (
    <Card className="overflow-hidden py-1.5">
      <ol aria-label="رویدادهای بازی">
        {finished && marker("پایان بازی")}
        {withScore.map((e, i) => {
          const isHome = e.side === "home";
          const body = (
            <span className={cn("flex min-w-0 items-center gap-2", isHome && "flex-row-reverse text-end")}>
              <EventIcon kind={e.kind} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{e.player}</span>
                {e.kind === "sub" && e.detail ? (
                  <span className="block truncate text-xs text-muted-foreground">به جای {e.detail}</span>
                ) : e.kind === "var" && e.detail ? (
                  <span className="block truncate text-xs text-muted-foreground">{e.detail}</span>
                ) : null}
              </span>
              {e.score && (
                <span className="flex shrink-0 items-center font-display text-[15px] font-bold tabular-nums">
                  {formatNumber(e.score[0])}
                  <span className="mx-0.5 text-muted-foreground">–</span>
                  {formatNumber(e.score[1])}
                </span>
              )}
            </span>
          );
          return (
            <Fragment key={`${e.minute}-${e.player}`}>
              {showHT && i === firstHalfAt && marker("بین دو نیمه")}
              <li
                aria-label={`دقیقهٔ ${formatNumber(e.minute)}، ${kindLabel[e.kind]}، ${e.player}${e.kind === "sub" && e.detail ? ` به جای ${e.detail}` : ""}، ${isHome ? home : away}${
                  e.score ? `، ${formatScore(e.score[0], e.score[1])}` : ""
                }`}
                className="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-2 px-3 py-2.5"
              >
                <span aria-hidden="true" className="min-w-0">
                  {isHome && body}
                </span>
                <span
                  aria-hidden="true"
                  className="mx-auto flex h-7 min-w-10 items-center justify-center rounded-full bg-surface-2 px-2 font-display text-sm font-bold"
                >
                  {formatMinute(e.minute)}
                </span>
                <span aria-hidden="true" className="min-w-0">
                  {!isHome && body}
                </span>
              </li>
            </Fragment>
          );
        })}
        {showHT && firstHalfAt === -1 && marker("بین دو نیمه")}
        {withScore.length === 0 && (
          <li className="px-4 py-5 text-center text-sm text-muted-foreground">
            {finished ? "گل، کارت یا تعویضی ثبت نشد." : "فعلاً آرامه. گل‌ها، کارت‌ها و تعویض‌ها اینجا میان."}
          </li>
        )}
        {marker("شروع بازی")}
      </ol>
    </Card>
  );
}
