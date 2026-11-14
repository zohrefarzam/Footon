"use client";

import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";

import { AchievementBadge } from "@/components/footon/achievement-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBadges, useConfig, useProgress } from "@/lib/gamification/queries";
import { copy } from "@/lib/gamification/strings";
import { BadgeWall } from "./badge-wall";
import { formatNumber } from "@/lib/format";

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
    <section id="achievements" aria-labelledby="badges-title" className="flex scroll-mt-24 flex-col gap-2.5">
      <h2 id="badges-title" className="flex items-center text-[13px] font-medium text-muted-foreground">
        {copy.badgesTitle}
        {badges && (
          <span className="ms-1.5 text-xs">
            <span className="font-display text-sm font-bold text-foreground">{formatNumber(badges.filter((b) => b.earnedAt).length)}</span> از {formatNumber(badges.length)}
          </span>
        )}
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
              <li key={b.id} className="flex">
                <AchievementBadge badge={b} className="flex-1" />
              </li>
            ))
          : Array.from({ length: max }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-[118px] rounded-lg" />
              </li>
            ))}
        {badges &&
          Array.from({ length: slots }, (_, i) => (
            <li key={`slot-${i}`}>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="bg-dots flex h-full min-h-[118px] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong p-3 text-[13px] font-semibold text-muted-foreground outline-none transition-[transform,color] duration-200 ease-spring hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-95"
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
