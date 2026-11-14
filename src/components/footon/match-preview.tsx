import { CalendarDays, CloudSun, MapPin, Newspaper, Tv, UserRound } from "lucide-react";

import { Card, CardRow } from "@/components/ui/card";
import { longDate } from "@/lib/dates";
import type { FormResult, Match, MatchPreview, Team } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { TeamCrest } from "./team-crest";
import { formatNumber } from "@/lib/format";

const icon = "size-[18px] shrink-0 text-muted-foreground";

/**
 * Match info, FotMob's venue card as one divided list: when, where, the ground,
 * weather, referee and where to watch. Icons are muted (information, not action).
 */
export function MatchInfo({ match: m, preview: p }: { match: Match; preview: MatchPreview }) {
  return (
    <Card className="overflow-hidden">
      <CardRow>
        <CalendarDays className={icon} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">{longDate(m.dayOffset)}</p>
          <p className="text-[13px] text-muted-foreground">
            شروع <span className="font-display text-sm font-bold text-foreground">{m.kickoff}</span> • {m.competition}
          </p>
        </div>
      </CardRow>
      <CardRow>
        <MapPin className={icon} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">{p.venue.name}</p>
          <p className="text-[13px] text-muted-foreground">{p.venue.city}</p>
        </div>
      </CardRow>
      <CardRow className="gap-6">
        <p className="text-[13px] text-muted-foreground">
          ظرفیت <span className="ms-1 font-display text-[15px] font-bold text-foreground">{formatNumber(p.venue.capacity)}</span>
        </p>
        <p className="text-[13px] text-muted-foreground">
          زمین <span className="ms-1 text-sm font-semibold text-foreground">{p.venue.surface}</span>
        </p>
      </CardRow>
      <CardRow>
        <CloudSun className={icon} aria-hidden="true" />
        <p className="flex-1 text-[13px] text-muted-foreground">پیش‌بینی هوا</p>
        <p className="text-sm font-semibold">
          <span className="font-display text-[15px] font-bold">{formatNumber(p.weather.tempC)}° سانتی‌گراد</span>
          <span className="mx-2 text-subtle" aria-hidden="true">
            |
          </span>
          {p.weather.sky}
        </p>
      </CardRow>
      <CardRow>
        <UserRound className={icon} aria-hidden="true" />
        <p className="flex-1 text-[13px] text-muted-foreground">داور</p>
        <p className="text-sm font-semibold">{p.referee}</p>
      </CardRow>
      <CardRow>
        <Tv className={icon} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">{p.tv.join("، ")}</p>
          <p className="text-[13px] text-muted-foreground">کجا ببینیم</p>
        </div>
      </CardRow>
    </Card>
  );
}

const formLabel: Record<FormResult, string> = { W: "برد", D: "مساوی", L: "باخت" };
const formLetter: Record<FormResult, string> = { W: "ب", D: "م", L: "ش" };

/**
 * Last five league results per team as letter chips, oldest to newest. Shape
 * carries it as well as tone: W solid, D dark, L outline. Neutral on purpose:
 * a team's win isn't yours, so no lime.
 */
export function TeamForm({ home, away, form }: { home: Team; away: Team; form: MatchPreview["form"] }) {
  return (
    <Card className="overflow-hidden">
      <p className="px-4 pt-3.5 pb-1 text-[13px] font-medium text-muted-foreground">وضعیت، پنج بازی اخیر</p>
      {([
        [home, form.home],
        [away, form.away],
      ] as const).map(([t, results]) => (
        <CardRow key={t.code} className="py-3">
          <TeamCrest code={t.code} colors={t.colors} size="xs" />
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{t.name}</span>
          <ol className="flex gap-1" aria-label={`وضعیت ${t.name}، از قدیمی به جدید: ${results.map((r) => formLabel[r]).join("، ")}`}>
            {results.map((r, i) => (
              <li
                key={i}
                aria-hidden="true"
                className={cn(
                  "flex size-6 items-center justify-center rounded-[7px] font-display text-[13px] font-bold",
                  r === "W" && "bg-foreground text-background",
                  r === "D" && "bg-surface-3 text-muted-foreground",
                  r === "L" && "border border-line-strong text-muted-foreground",
                )}
              >
                {formLetter[r]}
              </li>
            ))}
          </ol>
        </CardRow>
      ))}
    </Card>
  );
}

/** One headline about the match (FotMob's news card). */
export function MatchNews({ news }: { news: NonNullable<MatchPreview["news"]> }) {
  return (
    <Card className="flex-row items-start gap-3 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-surface-3">
        <Newspaper className="size-5 text-muted-foreground" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] leading-snug font-semibold text-balance">{news.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {news.source} • {news.ago}
        </p>
      </div>
    </Card>
  );
}
