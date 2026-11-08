"use client";

import { Award, Lock } from "lucide-react";

import { Card, CardRow } from "@/components/ui/card";
import { faNum } from "@/lib/gamification/format";
import { useLevel } from "@/lib/gamification/queries";
import type { FeatureId } from "@/lib/gamification/schemas";
import { fa, featureName } from "@/lib/gamification/strings.fa";
import { CORE_FEATURES } from "@/lib/gamification/unlocks";
import { FaScope } from "./fa-scope";
import { XpTrack } from "./level-progress-bar";
import { TierBadge } from "./tier-badge";

/**
 * Profile's Level card (`/me#level`): level in display 56, tier, badges, the
 * XP track and the next things a level opens, shown locked with their level.
 */
export function LevelCard() {
  const lv = useLevel();
  if (!lv) return <Card aria-busy="true" className="h-[236px]" />;

  const { progress, bar, tier, config } = lv;
  const next = (Object.entries(config.unlocks) as [FeatureId, number][])
    .filter(([f, l]) => !CORE_FEATURES.has(f) && l > progress.level)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2);

  return (
    <FaScope>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-end justify-between gap-4">
            <p className="font-display text-[56px] leading-[0.9] font-bold">
              <span className="me-1 text-[28px] text-muted-foreground">{fa.levelShort}</span>
              {faNum(progress.level)}
            </p>
            <div className="flex flex-col items-end gap-1.5">
              <TierBadge tier={tier.id} name={tier.name} />
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Award className="size-4" aria-hidden="true" />
                {fa.badges(progress.badgeCount)}
              </p>
            </div>
          </div>
          <XpTrack pct={bar.pct} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {bar.isMax ? (
              fa.maxLevel
            ) : (
              <>
                <bdi className="font-display text-sm font-bold text-foreground">{fa.xpOf(bar.into, bar.span)}</bdi> تا {fa.levelN(progress.level + 1)}
              </>
            )}
          </p>
        </div>
        {next.map(([f, l]) => (
          <CardRow key={f} className="border-t border-line">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-dashed border-line-strong">
              <Lock className="size-4 text-muted-foreground" strokeWidth={2.2} />
            </span>
            <p className="min-w-0 flex-1 text-[15px] font-semibold text-muted-foreground">{featureName[f]}</p>
            <span className="text-xs text-muted-foreground">{fa.levelRequired(l)}</span>
          </CardRow>
        ))}
      </Card>
    </FaScope>
  );
}
