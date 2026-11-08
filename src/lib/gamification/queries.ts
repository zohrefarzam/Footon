"use client";

import { useQuery, type QueryClient } from "@tanstack/react-query";

import { api } from "./api";
import { expandReward } from "./celebrations/expand";
import { celebrations } from "./celebrations/store";
import { curveFor, levelProgress, tierFor } from "./level";
import { toStreak, type GamificationConfig, type RewardResult, type UserProgress } from "./schemas";

export const gamificationKeys = {
  config: ["gamification", "config"] as const,
  flags: ["gamification", "flags"] as const,
  progress: ["gamification", "progress"] as const,
};

export const useConfig = () => useQuery({ queryKey: gamificationKeys.config, queryFn: api.getConfig, staleTime: Infinity });
export const useFlags = () => useQuery({ queryKey: gamificationKeys.flags, queryFn: api.getFlags, staleTime: Infinity });
export const useProgress = () => useQuery({ queryKey: gamificationKeys.progress, queryFn: api.getProgress, staleTime: 60_000 });

/**
 * Everything a level bar needs, from the server's numbers. Null until both
 * progress and config have loaded.
 */
export function useLevel() {
  const progress = useProgress().data;
  const config = useConfig().data;
  const flags = useFlags().data;
  if (!progress || !config || !flags) return null;
  const curve = curveFor(config, flags.levelCurve);
  return {
    progress,
    config,
    flags,
    curve,
    tier: tierFor(progress.level, config),
    bar: levelProgress(progress.totalXp, progress.level, curve, config.maxLevel),
  };
}

/**
 * The one place a server result lands: the cache takes the server's totals
 * as they are (no local maths, no optimistic XP), then the result is queued
 * for celebration. Safe to call twice with the same result.
 */
export function applyReward(qc: QueryClient, result: RewardResult) {
  const prev = qc.getQueryData<UserProgress>(gamificationKeys.progress);
  const config = qc.getQueryData<GamificationConfig>(gamificationKeys.config);

  if (prev) {
    qc.setQueryData<UserProgress>(gamificationKeys.progress, {
      ...prev,
      totalXp: result.totalXp,
      level: result.level,
      coins: result.coins,
      dailyXp: result.dailyXp,
      streak: toStreak(result.streak),
      badgeCount: prev.badgeCount + result.newBadges.length,
    });
  }
  // anything we can't patch exactly (combo, quests) refreshes from the server
  void qc.invalidateQueries({ queryKey: gamificationKeys.progress, refetchType: prev ? "none" : "active" });

  const items = expandReward(result, prev ? { totalXp: prev.totalXp, level: prev.level } : null, config ? (l) => tierFor(l, config).id : undefined);
  celebrations.getState().enqueue(result.id, items);
}
