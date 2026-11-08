"use client";

import { Award, Lock } from "lucide-react";

import { Card, CardRow } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/gamification/format";
import { useLevel } from "@/lib/gamification/queries";
import type { FeatureId } from "@/lib/gamification/schemas";
import { copy, featureName } from "@/lib/gamification/strings";
import { CORE_FEATURES } from "@/lib/gamification/unlocks";
import { XpTrack } from "./level-progress-bar";
import { TierRoundel } from "./tier-badge";

/**
 * Profile's Level card (`/me#level`): level in display 56, tier, badges, the
 * XP track and the next things a level opens, shown locked with their level.
 */
export function LevelCard() {
  const lv = useLevel();
  if (!lv) return <Skeleton className="h-[236px] rounded-xl" />;

  const { progress, bar, tier, config } = lv;
  const next = (Object.entries(config.unlocks) as [FeatureId, number][])
    .filter(([f, l]) => !CORE_FEATURES.has(f) && l > progress.level)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2);

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
              <span className="font-display text-base font-bold">{formatNumber(bar.span - bar.into)}</span> XP to {copy.levelN(progress.level + 1)}
            </>
          )}
        </p>
      </div>
      <div className="px-4 pt-3 pb-4">
        <XpTrack pct={bar.pct} className="h-2" />
        {!bar.isMax && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            <span className="font-display text-[13px] font-bold text-foreground">{formatNumber(bar.into)}</span>/{formatNumber(bar.span)} XP
          </p>
        )}
      </div>
      {next.map(([f, l]) => (
        <CardRow key={f} className="border-t border-line">
          <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-dashed border-line-strong">
            <Lock className="size-4 text-muted-foreground" strokeWidth={2.2} />
          </span>
          <p className="min-w-0 flex-1 text-[15px] font-semibold text-muted-foreground">{featureName[f]}</p>
          <span className="text-xs text-muted-foreground">{copy.levelRequired(l)}</span>
        </CardRow>
      ))}
    </Card>
  );
}
