"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ComboMeter } from "@/components/footon/gamification/combo-meter";
import { LevelProgressBar } from "@/components/footon/gamification/level-progress-bar";
import { PinnedBadges } from "@/components/footon/gamification/pinned-badges";
import { QuestList } from "@/components/footon/gamification/quests";
import { StreakCounter } from "@/components/footon/gamification/streak";
import { LockedFeatureGate } from "@/components/footon/gamification/locked-feature-gate";
import { RarityLabel } from "@/components/footon/gamification/rarity-label";
import { TierBadge } from "@/components/footon/gamification/tier-badge";
import { XpGainBurst } from "@/components/footon/gamification/xp-gain-burst";
import { Button } from "@/components/ui/button";
import { mockApi } from "@/lib/gamification/api";
import { userTimeZone } from "@/lib/gamification/day";
import { xpForLevel } from "@/lib/gamification/level";
import type { RewardResult } from "@/lib/gamification/schemas";
import { applyReward, gamificationKeys, useLevel } from "@/lib/gamification/queries";
import { mockToday } from "@/lib/mock-data";

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
  const mock = mockApi;
  const dev = mock.dev;

  const run = async (call: () => Promise<RewardResult>) => {
    setBusy(true);
    try {
      applyReward(qc, await call());
    } finally {
      setBusy(false);
    }
  };
  const grant = (xp: number) => run(() => dev.grantXp(xp));
  const predictToday = () =>
    run(() =>
      mock.submitPrediction({
        idempotencyKey: `demo_${Date.now()}`,
        matchId: `demo-${Date.now()}`,
        kickoff: `${mockToday}T20:00:00Z`,
        count: 1,
        timeZone: userTimeZone(),
      }),
    );
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
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => run(() => dev.resolveLiveQuestion(true))}>
          Right answer
        </Button>
        <Button variant="secondary" size="sm" disabled={busy} onClick={() => run(() => dev.resolveLiveQuestion(false))}>
          Wrong answer
        </Button>
        <Button variant="secondary" size="sm" disabled={busy} onClick={predictToday}>
          Predict today
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            dev.expireDailyQuests();
            void qc.invalidateQueries({ queryKey: gamificationKeys.quests });
          }}
        >
          New day
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            dev.breakStreak();
            void qc.invalidateQueries({ queryKey: gamificationKeys.progress });
          }}
        >
          Break streak
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
      <ComboMeter />
      <StreakCounter />
      <PinnedBadges />
      <QuestList kinds={["daily"]} title="Today's quests" />

      <LockedFeatureGate feature="stadium" title="Stadium">
        <p>Open</p>
      </LockedFeatureGate>
      <LockedFeatureGate feature="publicLeague" variant="button" title="Public league">
        <Button size="lg">Public league</Button>
      </LockedFeatureGate>
    </div>
  );
}
