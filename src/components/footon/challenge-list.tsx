"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatCoins } from "@/lib/economy";
import { challengeHref, type ChallengeWithMatch } from "@/lib/challenges";
import type { Challenge } from "@/lib/mock-data";
import { cn, ordinal } from "@/lib/utils";
import { BoostBadge } from "./boost-badge";
import { LeagueBadge } from "./league-badge";
import { LiveDot } from "./live";
import { SegmentedTabs } from "./segmented-tabs";

const SEGMENTS = ["Joined", "Invited", "Expired"] as const;
type Segment = (typeof SEGMENTS)[number];
const inSegment: Record<Segment, Challenge["status"][]> = {
  Joined: ["joined", "finished"],
  Invited: ["invited"],
  Expired: ["expired"],
};
const empty: Record<Segment, string> = {
  Joined: "You're not in a challenge yet. Accept an invite or start one.",
  Invited: "No invites waiting.",
  Expired: "Nothing expired. You answer fast.",
};

/** One challenge as a divided row: name, who, match, entry, players, then your place or what's next. */
export function ChallengeRow({ c }: { c: ChallengeWithMatch }) {
  const m = c.match;
  const live = m.status === "live";
  const expired = c.status === "expired";
  const when = live ? `${m.minute}'` : m.status === "finished" ? "FT" : `${m.day ?? "Today"} ${m.kickoff}`;
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
            {m.home.code} v {m.away.code}
          </span>
          <span className={cn("shrink-0 font-display text-[13px] font-bold", live && "text-live")}>{when}</span>
          <span className="truncate">
            · {c.mine ? "by you" : c.from ? `from ${c.from.name}` : ""} · {formatCoins(c.entry)} entry
          </span>
        </p>
      </div>
      <AvatarGroup aria-label={`${c.members.length} players`} className="max-[359px]:hidden">
        {c.members.slice(0, 4).map((x, i) => (
          <Avatar key={i} className="size-6 ring-surface">
            <AvatarFallback className={cn("text-[11px]", x === "Y" && "bg-primary text-primary-foreground")}>{x}</AvatarFallback>
          </Avatar>
        ))}
      </AvatarGroup>
      {expired ? (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          Expired
        </span>
      ) : c.status === "invited" ? (
        <span className="rounded-full bg-surface-3 px-2 py-0.5 text-xs font-semibold">Invite</span>
      ) : c.rank ? (
        <span
          className={cn("w-10 text-end font-display text-xl font-bold", c.rank === 1 && (c.status === "finished" ? "text-gold" : "text-primary"))}
          aria-label={c.status === "finished" ? `Finished ${ordinal(c.rank)}` : `${ordinal(c.rank)} now`}
        >
          {ordinal(c.rank)}
        </span>
      ) : (
        <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
      )}
    </Link>
  );
}

/** Joined · Invited · Expired over one divided list. Every row opens the challenge's own page. */
export function ChallengeList({ challenges }: { challenges: ChallengeWithMatch[] }) {
  const [seg, setSeg] = useState<Segment>("Joined");
  const list = challenges.filter((c) => inSegment[seg].includes(c.status));
  return (
    <section aria-label="Your challenges" className="flex flex-col gap-2.5">
      <SegmentedTabs options={SEGMENTS} value={seg} onValueChange={setSeg} label="Challenges" />
      <div aria-live="polite">
        {list.length ? (
          <Card className="overflow-hidden">
            {list.map((c) => (
              <ChallengeRow key={c.id} c={c} />
            ))}
          </Card>
        ) : (
          <p className="bg-dots rounded-[20px] border border-dashed border-line-strong px-6 py-10 text-center text-sm text-muted-foreground">{empty[seg]}</p>
        )}
      </div>
    </section>
  );
}
