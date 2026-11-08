"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { LevelProgressBar } from "@/components/footon/gamification/level-progress-bar";
import { LockedFeatureGate } from "@/components/footon/gamification/locked-feature-gate";
import { RarityLabel } from "@/components/footon/gamification/rarity-label";
import { TierBadge } from "@/components/footon/gamification/tier-badge";
import { XpGainBurst } from "@/components/footon/gamification/xp-gain-burst";
import { Button } from "@/components/ui/button";
import { mockApi } from "@/lib/gamification/api";
import { xpForLevel } from "@/lib/gamification/level";
import { applyReward, gamificationKeys, useLevel } from "@/lib/gamification/queries";

/**
 * Gamification pieces plus a control panel for the MOCK server (styleguide
 * only). Grants come from the mock server as real-shaped results, so they
 * run through the same path a backend reward would.
 */
export function GamificationDemo() {
  const qc = useQueryClient();
  const lv = useLevel();
  const [offline, setOffline] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!mockApi) return <p className="text-sm text-muted-foreground">Demo controls need the mock API.</p>;
  const dev = mockApi.dev;

  const grant = async (xp: number) => {
    setBusy(true);
    try {
      applyReward(qc, await dev.grantXp(xp));
    } finally {
      setBusy(false);
    }
  };
  const levelsUp = (n: number) => (lv ? xpForLevel(lv.progress.level + n, lv.curve) - lv.progress.totalXp : 0);

  return (
    <div className="flex flex-col gap-4">
      <LevelProgressBar />

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => grant(40)}>
          +40 XP
        </Button>
        <Button variant="secondary" size="sm" disabled={busy || !lv} onClick={() => grant(levelsUp(1))}>
          Next level
        </Button>
        <Button variant="secondary" size="sm" disabled={busy || !lv} onClick={() => grant(levelsUp(3))}>
          Three levels
        </Button>
        <Button
          variant={offline ? "soft" : "secondary"}
          size="sm"
          aria-pressed={offline}
          onClick={() => {
            dev.setOffline(!offline);
            setOffline(!offline);
          }}
        >
          Offline
        </Button>
        <Button variant="secondary" size="sm" onClick={() => dev.failNext("server")}>
          Fail next call
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            dev.reset();
            setOffline(false);
            void qc.invalidateQueries({ queryKey: gamificationKeys.progress });
          }}
        >
          Reset
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {lv?.config.tiers.map((t) => <TierBadge key={t.id} tier={t.id} name={t.name} />)}
      </div>
      <div className="flex justify-center">
        {lv && <XpGainBurst xpGained={20} coinsGained={20} fromXp={lv.progress.totalXp - 20} toXp={lv.progress.totalXp} level={lv.progress.level} reduced={false} comboMultiplier={2} curve={lv.curve} maxLevel={lv.config.maxLevel} />}
      </div>
      <RarityLabel pct={9.5} />

      <LockedFeatureGate feature="stadium" title="Stadium">
        <p>Open</p>
      </LockedFeatureGate>
      <LockedFeatureGate feature="publicLeague" variant="button" title="Public league">
        <Button size="lg">Public league</Button>
      </LockedFeatureGate>
    </div>
  );
}
