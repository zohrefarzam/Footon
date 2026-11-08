"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { api } from "./api";
import { ApiError, type PurchaseInput } from "./api/client";
import { expandReward } from "./celebrations/expand";
import { celebrations } from "./celebrations/store";
import { curveFor, levelProgress, tierFor } from "./level";
import {
  toStreak,
  type GamificationConfig,
  type PurchaseResult,
  type QuestBoard,
  type RewardResult,
  type ShopCatalog,
  type UserProgress,
} from "./schemas";

export const gamificationKeys = {
  config: ["gamification", "config"] as const,
  flags: ["gamification", "flags"] as const,
  progress: ["gamification", "progress"] as const,
  badges: ["gamification", "badges"] as const,
  quests: ["gamification", "quests"] as const,
  shop: ["gamification", "shop"] as const,
  club: (userId = "me") => ["gamification", "club", userId] as const,
};

export const useConfig = () => useQuery({ queryKey: gamificationKeys.config, queryFn: api.getConfig, staleTime: Infinity });
export const useFlags = () => useQuery({ queryKey: gamificationKeys.flags, queryFn: api.getFlags, staleTime: Infinity });
export const useProgress = () => useQuery({ queryKey: gamificationKeys.progress, queryFn: api.getProgress, staleTime: 60_000 });
export const useShop = () => useQuery({ queryKey: gamificationKeys.shop, queryFn: api.getShop, staleTime: 60_000 });
export const useMyClub = (userId = "me") =>
  useQuery({ queryKey: gamificationKeys.club(userId), queryFn: () => api.getMyClub(userId === "me" ? undefined : userId), staleTime: 60_000 });

/**
 * Buy one item. The button using this waits for `isPending`; the cache only
 * changes when the server answers (its coins, its item state, its freezes).
 * A refusal (409 / 402) refetches what may have changed underneath.
 */
export function usePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PurchaseInput) => api.purchase(input),
    onSuccess: (r: PurchaseResult) => {
      qc.setQueryData<ShopCatalog>(gamificationKeys.shop, (c) => (c ? { items: c.items.map((i) => (i.id === r.item.id ? r.item : i)) } : c));
      qc.setQueryData<UserProgress>(gamificationKeys.progress, (p) => (p ? { ...p, coins: r.coins, ...(r.streak ? { streak: r.streak } : {}) } : p));
    },
    onError: (e) => {
      if (e instanceof ApiError && (e.code === "conflict" || e.code === "insufficient_balance")) {
        void qc.invalidateQueries({ queryKey: gamificationKeys.shop });
        void qc.invalidateQueries({ queryKey: gamificationKeys.progress });
      }
    },
  });
}

/** Put an owned item on your club; the server answers with the club as it now is. */
export function useEquip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.equip(itemId),
    onSuccess: ({ club }, itemId) => {
      qc.setQueryData(gamificationKeys.club("me"), club);
      qc.setQueryData<ShopCatalog>(gamificationKeys.shop, (c) => {
        if (!c) return c;
        const slot = c.items.find((i) => i.id === itemId)?.slot;
        return { items: c.items.map((i) => (i.slot === slot ? { ...i, equipped: i.id === itemId } : i)) };
      });
    },
  });
}

export const useQuests = () => useQuery({ queryKey: gamificationKeys.quests, queryFn: api.getQuests, staleTime: 60_000 });
export const useBadges = () => useQuery({ queryKey: gamificationKeys.badges, queryFn: api.getBadges, staleTime: 60_000 });

/**
 * Pin a set of badges. The server answers with the pinned set, which goes
 * into the cache as-is; on a 409 (the set no longer fits) we refetch.
 */
export function usePinBadges() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api.pinBadges(ids),
    onSuccess: ({ pinnedBadges }) => {
      qc.setQueryData<UserProgress>(gamificationKeys.progress, (p) => (p ? { ...p, pinnedBadges } : p));
    },
    onError: () => void qc.invalidateQueries({ queryKey: gamificationKeys.progress }),
  });
}

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
      combo: result.combo,
      badgeCount: prev.badgeCount + result.newBadges.length,
    });
  } else {
    void qc.invalidateQueries({ queryKey: gamificationKeys.progress });
  }
  if (result.newBadges.length > 0) void qc.invalidateQueries({ queryKey: gamificationKeys.badges });
  if (result.questProgress.length > 0) {
    const byId = new Map(result.questProgress.map((q) => [q.questId, q]));
    qc.setQueryData<QuestBoard>(gamificationKeys.quests, (board) =>
      board
        ? {
            ...board,
            quests: board.quests.map((q) => {
              const u = byId.get(q.id);
              return u ? { ...q, progress: u.progress, completed: q.completed || u.completedNow || u.progress >= u.target } : q;
            }),
          }
        : board,
    );
  }

  const items = expandReward(result, prev ? { totalXp: prev.totalXp, level: prev.level } : null, config ? (l) => tierFor(l, config).id : undefined);
  celebrations.getState().enqueue(result.id, items);
}
