"use client";

import { Award } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/gamification/format";
import { useLevel } from "@/lib/gamification/queries";
import { copy } from "@/lib/gamification/strings";
import { XpTrack } from "./level-progress-bar";
import { TierRoundel } from "./tier-badge";

/**
 * Profile's Level card (`/me#level`): level in display 56, tier, badges, the
 * XP track. What a level opens shows where it lives (Home's Fantasy tile, the shop), not here.
 */
export function LevelCard() {
  const lv = useLevel();
  if (!lv) return <Skeleton className="h-[150px] rounded-xl" />;

  const { progress, bar, tier } = lv;

  return (
    <Card className="overflow-hidden">
      {/* same anatomy as the division and league cards: roundel + title, the big number, the strip */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <TierRoundel tier={tier.id} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{copy.tierTitle(tier.name)}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Award className="size-3.5" aria-hidden="true" />
            {copy.badges(progress.badgeCount)}
          </p>
        </div>
      </div>
      <div className="flex items-end gap-3 px-4 pt-3">
        <p className="font-display text-[44px] leading-[0.9] font-bold">
          <span className="me-1 text-xl text-muted-foreground">{copy.levelShort}</span>
          {formatNumber(progress.level)}
        </p>
        <p className="ms-auto pb-1 text-end text-[13px] font-semibold">
          {bar.isMax ? (
            copy.maxLevel
          ) : (
            <>
              <span className="font-display text-base font-bold">{formatNumber(bar.span - bar.into)}</span> XP تا {copy.levelN(progress.level + 1)}
            </>
          )}
        </p>
      </div>
      <div className="px-4 pt-3 pb-4">
        <XpTrack pct={bar.pct} className="h-2" />
      </div>
    </Card>
  );
}
