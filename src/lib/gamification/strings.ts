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

  // Badges
  newBadge: "NEW BADGE",
  badgesTitle: "Badges",
  allBadges: "All badges",
  earnedOf: (e: number, t: number) => `${n(e)} of ${n(t)}`,
  notEarned: "Not yet",
  pin: "Pin",
  pinned: "Pinned",
  pinBadge: (name: string) => `Pin ${name}`,
  unpinBadge: (name: string) => `Unpin ${name}`,
  pinFull: (max: number) => `Pin up to ${n(max)}. Unpin one to swap.`,
  pinSlot: "Pin a badge",
  pinFailed: "Couldn't save that. Try again.",
  badgeFamily: { level: "Level", achievement: "Achievements", social: "Social", seasonal: "Seasonal" },

  // Streak (match days in a row)
  streakEyebrow: "STREAK",
  streakUnit: (d: number) => (d === 1 ? "match day in a row" : "match days in a row"),
  streakNone: "Call any match to start a run.",
  bestRun: (d: number) => `Best ${n(d)}`,
  bestRunLabel: "Your best run",
  toMilestone: (left: number, at: number) => `${n(left)} more to the ${n(at)}-day reward`,
  milestoneHit: (d: number) => `${n(d)}-day reward unlocked`,
  freezeUsed: "A freeze kept your run alive",
  freezes: (held: number, max: number) => `${n(held)} of ${n(max)} streak freezes`,
  freezeShort: "Freezes",

  // Broken streak: no blame, no alarm
  brokenTitle: "That run's over",
  brokenBody: (best: number) => `Your best is still ${n(best)} match ${best === 1 ? "day" : "days"}. Every run starts with one call.`,
  brokenCta: "Start a new run",
  brokenLater: "Not now",

  // Quests
  questsToday: "Today's quests",
  questsWeek: "This week",
  questsLong: "Season and league",
  weeklyQuests: "Weekly quests",
  doneOf: (d: number, t: number) => `${n(d)} of ${n(t)} done`,
  questDifficulty: { easy: "Easy", social: "With friends", challenge: "Challenge" },
  questKind: { daily: "Daily", weekly: "Weekly", seasonal: "Season", group: "League" },
  resetsIn: (left: string) => `Resets in ${left}`,
  endsIn: (left: string) => `Ends in ${left}`,
  questDone: "Done",
  questDoneEyebrow: "QUEST DONE",
  questReward: (xp: number, coins: number) => `+${n(xp)} XP · ${n(coins)} coins`,
  questAria: (title: string, p: number, t: number, done: boolean) => (done ? `${title}, done` : `${title}, ${n(p)} of ${n(t)}`),

  // Shop
  shopTitle: "Shop",
  shopBlurb: "Kits, stadiums, boots for your club",
  shopIntro: "Looks for your club. Nothing here changes a call, a point or a prize.",
  shopRules: "Levels can't be bought. Coins never buy points, rank or prizes, and there are no mystery boxes.",
  shopSection: { freeze: "Keep your run", kit: "Kits", stadium: "Stadiums", boots: "Boots", frame: "Frames" },
  isNew: "New",
  owned: "Owned",
  equipped: "On your club",
  free: "Free",
  previewOn: "On your club",
  buyLabel: "Buy",
  confirmTitle: (name: string) => `Buy ${name}?`,
  confirmBody: (price: number, after: number) => `${n(price)} coins. You'll have ${n(after)} left.`,
  confirmSplit: (free: number, premium: number) => `${n(free)} free coins first, then ${n(premium)} premium`,
  confirm: "Buy it",
  cancel: "Not now",
  buying: "Buying…",
  bought: "It's yours",
  equip: "Put it on",
  equipping: "Putting it on…",
  done: "Done",
  needMore: (c: number) => `Need ${n(c)} more coins`,
  waysToEarn: "Ways to earn",
  conflict: "That changed while you were looking. Check it and try again.",
  offline: "Couldn't reach the shop. Nothing was charged.",
  noFunds: "Not enough coins for this one yet.",
  tryAgain: "Try again",
  freezeFull: (max: number) => `You hold ${n(max)} freezes, the most you can`,
  itemAria: (name: string, state: string) => `${name}, ${state}`,
  priceAria: (price: number) => `${n(price)} coins`,

  // My Club
  myClub: "My Club",
  myClubBlurb: "Kit, stadium, boots, badges. Friends see it too.",
  clubUnavailable: "This club isn't open to you.",
  customise: "Customise in the shop",
  shareClub: "Share to Telegram",
  sharing: "Making the card…",
  shareClubText: (name: string, level: number, tier: string) => `${name} on Footon: level ${n(level)}, ${tier}. Call the next match with me.`,
  clubAria: (name: string, level: number, tier: string, kit: string | null, streak: number) =>
    `${name}: level ${n(level)}, ${tier}${kit ? `, wearing ${kit}` : ""}${streak > 0 ? `, ${n(streak)} match days in a row` : ""}`,

  // Combo (right answers in a row, in one match)
  comboLabel: "Combo",
  comboCount: (c: number) => (c === 0 ? "No run yet" : `${n(c)} right in a row`),
  comboAria: (c: number, m: number, next: { at: number; multiplier: number } | null) =>
    `Combo: ${n(c)} right in a row, XP ${formatTimes(m)}${next ? `. ${formatTimes(next.multiplier)} at ${n(next.at)}` : ""}`,
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
