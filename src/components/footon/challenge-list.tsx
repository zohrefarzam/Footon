"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCoins } from "@/lib/economy";
import { challengeHref, type ChallengeWithMatch } from "@/lib/challenges";
import { YOU_INITIAL, type Challenge } from "@/lib/mock-data";
import { cn, ordinal } from "@/lib/utils";
import { BoostBadge } from "./boost-badge";
import { EmptyArt, type EmptyArtName } from "./empty-art";
import { LeagueBadge } from "./league-badge";
import { LiveDot } from "./live";
import { SectionHeading } from "./section-heading";
import { SegmentedTabs } from "./segmented-tabs";
import { formatNumber, matchup } from "@/lib/format";
import { matchWhen } from "@/lib/dates";

const SEGMENTS = ["عضوی", "دعوت‌شده", "منقضی"] as const;
type Segment = (typeof SEGMENTS)[number];
const inSegment: Record<Segment, Challenge["status"][]> = {
  عضوی: ["joined", "finished"],
  "دعوت‌شده": ["invited"],
  منقضی: ["expired"],
};
const empty = {
  عضوی: { art: "goal", title: "هنوز توی هیچ چالشی نیستی", body: "یه دعوت را قبول کن یا خودت یکی بساز.", action: { label: "ساختن چالش", href: "/challenges/new" } },
  "دعوت‌شده": { art: "invite", title: "دعوتی در انتظار نیست", body: "وقتی دوستات دعوتت کنن، اینجا میاد." },
  منقضی: { art: "time", title: "چیزی منقضی نشده", body: "سریع جواب میدی." },
} satisfies Record<Segment, { art: EmptyArtName; title: string; body: string; action?: { label: string; href: string } }>;

/** One challenge as a divided row: name, who, match, entry, players, then your place or what's next. */
export function ChallengeRow({ c }: { c: ChallengeWithMatch }) {
  const m = c.match;
  const live = m.status === "live";
  const expired = c.status === "expired";
  // a row is tight: today's kickoff reads as just the time, like a fixtures list
  const when = m.status === "upcoming" && (!m.day || m.day === "امروز") && m.kickoff ? m.kickoff : matchWhen(m);
  return (
    <Link
      href={challengeHref(c)}
      className="flex items-center gap-3 px-4 py-3.5 outline-none transition-colors hover:bg-surface-hover focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60 [&+&]:border-t [&+&]:border-line"
    >
      <LeagueBadge name={c.name} size="sm" className={cn(expired && "opacity-50 grayscale")} />
      <div className="min-w-0 flex-1">
        <p className={cn("flex items-center gap-2 text-[15px] font-semibold", expired && "text-muted-foreground")}>
          <span className="truncate">{c.name}</span>
          {m.boost && !expired && <BoostBadge />}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 overflow-hidden text-xs whitespace-nowrap text-muted-foreground">
          {live && <LiveDot className="size-[5px] shrink-0" />}
          <span className="shrink-0 font-display text-[13px] font-bold">
            {matchup(m.home.code, m.away.code)}
          </span>
          <span className={cn("shrink-0 font-display text-[13px] font-bold", live && "text-live")}>{when}</span>
          <span className="shrink-0">•</span>
          <span className="flex shrink-0 items-center gap-0.5 font-display text-[13px] font-bold text-live">
            <span className="sr-only">ورودی</span>
            {formatCoins(c.entry)}
            <span aria-hidden="true" className="text-[11px] max-[359px]:hidden">C</span>
          </span>
          <span className="sr-only">• {c.mine ? "ساختهٔ تو" : c.from ? `از ${c.from.name}` : ""}</span>
        </p>
      </div>
      <AvatarGroup aria-label={`${formatNumber(c.members.length)} بازیکن`} className="max-[359px]:hidden">
        {c.members.slice(0, 3).map((x, i) => (
          <Avatar key={i} className="size-[22px] ring-surface">
            <AvatarFallback className={cn("text-[11px]", x === YOU_INITIAL && "bg-primary text-primary-foreground")}>{x}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      {expired ? (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          منقضی
        </span>
      ) : c.status === "invited" ? (
        <span className="rounded-full bg-surface-3 px-2 py-0.5 text-xs font-semibold">دعوت</span>
      ) : c.rank ? (
        <span
          className={cn("w-10 text-end font-display text-xl font-bold", c.rank === 1 && (c.status === "finished" ? "text-gold" : "text-primary"))}
          aria-label={c.status === "finished" ? `پایان با رتبهٔ ${ordinal(c.rank)}` : `الان ${ordinal(c.rank)}`}
        >
          {ordinal(c.rank)}
        </span>
      ) : (
        <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
      )}
    </Link>
  );
}

/** Joined • Invited • Expired over one divided list. Every row opens the challenge's own page. */
export function ChallengeList({ challenges }: { challenges: ChallengeWithMatch[] }) {
  const [seg, setSeg] = useState<Segment>("عضوی");
  const list = challenges.filter((c) => inSegment[seg].includes(c.status));
  return (
    <section aria-labelledby="my-challenges" className="flex flex-col gap-2.5">
      <SectionHeading id="my-challenges" title="چالش‌های من" />
      <SegmentedTabs options={SEGMENTS} value={seg} onValueChange={setSeg} label="چالش‌ها" />
      <div aria-live="polite">
        {list.length ? (
          <Card className="overflow-hidden">
            {list.map((c) => (
              <ChallengeRow key={c.id} c={c} />
            ))}
          </Card>
        ) : (
          <EmptyCard {...empty[seg]} />
        )}
      </div>
    </section>
  );
}

/** A tab with nothing in it: icon, what's missing, one line, and the next step when there is one. */
function EmptyCard({ art, title, body, action }: (typeof empty)[Segment] & { action?: { label: string; href: string } }) {
  return (
    <div className="bg-dots flex flex-col items-center gap-2 rounded-[20px] border border-dashed border-line-strong px-6 py-9 text-center">
      <EmptyArt name={art} />
      <p className="mt-1 text-[15px] font-semibold">{title}</p>
      <p className="max-w-[28ch] text-sm text-muted-foreground">{body}</p>
      {action && (
        <Button asChild variant="secondary" size="sm" className="mt-2">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
