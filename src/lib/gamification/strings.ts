import { formatNumber as n, formatTimes } from "./format";
import type { FeatureId } from "./schemas";

/**
 * Copy for gamification surfaces. Short and spoken, like the rest of Footon.
 * Kept in one place so a later translation pass has a single file to swap.
 */
export const copy = {
  levelShort: "LV",
  levelRequired: (l: number) => `Level ${n(l)} required`,
  levelN: (l: number) => `Level ${n(l)}`,
  xpOf: (into: number, span: number) => `${n(into)} of ${n(span)} XP`,
  xpToGo: (x: number) => `${n(x)} XP to go`,
  maxLevel: "Top level",
  badges: (c: number) => `${n(c)} ${c === 1 ? "badge" : "badges"}`,

  // Level up
  levelUpEyebrow: "LEVEL UP",
  levelUpTitle: (l: number) => `You reached level ${n(l)}`,
  newTier: "New tier",
  unlockedNow: "Unlocked",
  levelBadge: "Level badge",
  continue: "Continue",
  share: "Share",
  shareLevelText: (l: number, tier: string) => `I just hit level ${n(l)} (${tier}) on Footon. Come call the next match with me.`,

  // Celebrations, announced via aria-live
  announceXp: (xp: number, coins: number, multiplier: number) =>
    `+${n(xp)} XP and ${n(coins)} coins${multiplier > 1 ? `, ${formatTimes(multiplier)} combo` : ""}`,
  announceLevel: (l: number, tier: string) => `Level ${n(l)}, ${tier}`,
  announceStreak: (d: number) => `${n(d)} match ${d === 1 ? "day" : "days"} in a row`,
  announceBadge: (name: string) => `New badge: ${name}`,
  announceQuest: (title: string) => `Quest done: ${title}`,
  best: (d: number) => `Best ${n(d)}`,
  skip: "Dismiss",
  close: "Close",
  locked: "locked",
  rarity: "of players have it",
} as const;

/** What a level opens, for the Level Up screen, the Level card and locked gates. */
export const featureName: Record<FeatureId, string> = {
  predictions: "Predictions",
  livePredictions: "Live predictions",
  profile: "Profile",
  joinLeague: "Join a league",
  weeklyLeaderboard: "Weekly leaderboard",
  createLeague: "Create a league",
  invite: "Invite friends",
  reactions: "Reactions and stickers",
  shopFreeze: "Shop: Streak Freeze",
  shop: "Full shop",
  myClubKit: "Your club's first kit",
  weeklyQuests: "Weekly quests",
  fantasy: "Fantasy",
  stadium: "Stadium",
  boots: "Boots",
  fantasyBench: "Fantasy bench",
  publicLeague: "Public leagues",
  seasonBoard: "Season leaderboard",
  legendFrame: "Legend frame and title",
};
