"use client";

import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";

import { formatPercent } from "@/lib/gamification/format";
import { useBadges, useConfig, useProgress } from "@/lib/gamification/queries";
import { copy } from "@/lib/gamification/strings";
import { BadgeGlyph } from "./badge-glyph";
import { BadgeWall } from "./badge-wall";

/**
 * Profile's badges: the (up to 3) you pinned, empty slots that open the wall
 * to pin one, and "All badges" for the full wall.
 */
export function PinnedBadges() {
  const [open, setOpen] = useState(false);
  const badges = useBadges().data?.badges;
  const progress = useProgress().data;
  const max = useConfig().data?.pinnedBadgesMax ?? 3;

  const pinned = (progress?.pinnedBadges ?? []).flatMap((id) => badges?.find((b) => b.id === id) ?? []);
  const slots = Math.max(0, max - pinned.length);

  return (
    <section aria-labelledby="badges-title" className="flex flex-col gap-2.5">
      <h2 id="badges-title" className="flex items-center text-[13px] font-medium text-muted-foreground">
        {copy.badgesTitle}
        {badges && <span className="ms-1.5">· {copy.earnedOf(badges.filter((b) => b.earnedAt).length, badges.length)}</span>}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ms-auto -my-3 flex h-11 items-center gap-0.5 rounded-md ps-2 font-semibold outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
        >
          {copy.allBadges}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </button>
      </h2>

      <ul className="grid grid-cols-3 gap-2">
        {badges
          ? pinned.map((b) => (
              <li key={b.id} className="flex flex-col items-center gap-1.5 rounded-lg border border-line bg-surface p-3 text-center">
                <BadgeGlyph badge={b} />
                <span className="text-[13px] leading-tight font-semibold">{b.name}</span>
                <span className="font-display text-[13px] font-bold text-muted-foreground">
                  {formatPercent(b.rarityPct)}
                  <span className="sr-only"> {copy.rarity}</span>
                </span>
              </li>
            ))
          : Array.from({ length: max }, (_, i) => <li key={i} aria-hidden="true" className="h-[118px] rounded-lg border border-line bg-surface" />)}
        {badges &&
          Array.from({ length: slots }, (_, i) => (
            <li key={`slot-${i}`}>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-full min-h-[118px] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong p-3 text-[13px] font-semibold text-muted-foreground outline-none transition-[transform,color] duration-200 ease-spring hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-95"
              >
                <Plus className="size-4" aria-hidden="true" />
                {copy.pinSlot}
              </button>
            </li>
          ))}
      </ul>

      <BadgeWall open={open} onOpenChange={setOpen} />
    </section>
  );
}
