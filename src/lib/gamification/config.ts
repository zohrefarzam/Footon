import type { FeatureFlags, GamificationConfig } from "./schemas";

/**
 * The mock config endpoint's payload. Components never import this directly:
 * they read `useConfig()`, so swapping in the real endpoint changes nothing in UI.
 */
export const mockConfig: GamificationConfig = {
  maxLevel: 30,
  curves: {
    default: { base: 100, growth: 25 },
    // A/B variant: a flatter climb after the first levels
    gentle: { base: 100, growth: 18 },
  },
  tiers: [
    { id: "academy", from: 1, to: 4, name: "آکادمی" },
    { id: "reserve", from: 5, to: 9, name: "ذخیره" },
    { id: "startingXI", from: 10, to: 14, name: "ترکیب اصلی" },
    { id: "star", from: 15, to: 19, name: "ستاره" },
    { id: "captain", from: 20, to: 24, name: "کاپیتان" },
    { id: "legend", from: 25, to: 29, name: "اسطوره" },
    { id: "gaffer", from: 30, to: 30, name: "سرمربی" },
  ],
  unlocks: {
    predictions: 1,
    livePredictions: 1,
    profile: 1,
    joinLeague: 1,
    weeklyLeaderboard: 1,
    createLeague: 2,
    invite: 2,
    reactions: 2,
    shopFreeze: 3,
    shop: 5,
    myClubKit: 5,
    weeklyQuests: 6,
    fantasy: 8,
    stadium: 10,
    boots: 12,
    fantasyBench: 15,
    publicLeague: 20,
    seasonBoard: 20,
    legendFrame: 25,
  },
  dailyXp: { softCap: 300, overCapRate: 0.5 },
  streak: { milestones: [3, 7, 14, 30], freezesPerWeek: 1, maxFreezes: 2 },
  combo: [
    { at: 3, multiplier: 2 },
    { at: 5, multiplier: 3 },
  ],
  quests: { dailyCount: 3 },
  pinnedBadgesMax: 3,
};

export const defaultFlags: FeatureFlags = {
  dailyQuestCount: 3,
  levelUpShareStyle: "button",
  levelCurve: "default",
  firstKitPrice: 1500,
  premiumCoins: false,
};
