/**
 * Gamification contract with the server. The server owns every number here
 * (XP, coins, level, badges, streak, quests); the client parses what it gets
 * with these schemas and only displays it. Types are inferred from the
 * schemas so the two can't drift.
 */
import { z } from "zod";

export const TierId = z.enum(["academy", "reserve", "startingXI", "star", "captain", "legend", "gaffer"]);
export type TierId = z.infer<typeof TierId>;

/** Everything a level can unlock. The core loop ids are never locked (see `unlocks.ts`). */
export const FeatureId = z.enum([
  // core loop, level 1
  "predictions",
  "livePredictions",
  "profile",
  "joinLeague",
  "weeklyLeaderboard",
  // unlocked by level
  "createLeague",
  "invite",
  "reactions",
  "shopFreeze",
  "shop",
  "myClubKit",
  "weeklyQuests",
  "fantasy",
  "stadium",
  "boots",
  "fantasyBench",
  "publicLeague",
  "seasonBoard",
  "legendFrame",
]);
export type FeatureId = z.infer<typeof FeatureId>;

export const BadgeFamily = z.enum(["level", "achievement", "social", "seasonal"]);
export type BadgeFamily = z.infer<typeof BadgeFamily>;

export const Badge = z.object({
  id: z.string(),
  family: BadgeFamily,
  /** Display name, already localised by the server. */
  name: z.string(),
  description: z.string().optional(),
  /** Icon key from the client's badge icon set. */
  icon: z.string(),
  /** Share of users who hold it, 0–100. */
  rarityPct: z.number().min(0).max(100),
  /** Level badges only: the level that awards it. */
  level: z.number().int().optional(),
  earnedAt: z.string().nullable(),
});
export type Badge = z.infer<typeof Badge>;

export const Streak = z.object({
  /** Consecutive match days with at least one real prediction. */
  current: z.number().int().nonnegative(),
  best: z.number().int().nonnegative(),
  /** Day key (`YYYY-MM-DD`, match start date in the user's timezone) of the last counted day. */
  lastDayKey: z.string().nullable(),
  freezesHeld: z.number().int().nonnegative(),
  status: z.enum(["none", "active", "broken"]),
});
export type Streak = z.infer<typeof Streak>;

/** The streak as it stands after an action, plus what that action did to it. */
export const StreakUpdate = Streak.extend({
  incrementedNow: z.boolean(),
  milestone: z.number().int().nullable(),
  freezeUsed: z.boolean(),
});
export type StreakUpdate = z.infer<typeof StreakUpdate>;

/** The plain streak from an update (Zod drops the per-action fields). */
export const toStreak = (u: StreakUpdate): Streak => Streak.parse(u);

export const LevelUp = z.object({
  level: z.number().int().positive(),
  tier: TierId,
  unlocks: z.array(FeatureId),
  badge: Badge.nullable(),
});
export type LevelUp = z.infer<typeof LevelUp>;

export const QuestProgress = z.object({
  questId: z.string(),
  title: z.string(),
  progress: z.number().int().nonnegative(),
  target: z.number().int().positive(),
  completedNow: z.boolean(),
  /** What finishing it paid (already included in the result's totals). */
  reward: z.object({ xp: z.number().int().nonnegative(), coins: z.number().int().nonnegative() }).optional(),
});
export type QuestProgress = z.infer<typeof QuestProgress>;

export const DailyXp = z.object({
  earned: z.number().nonnegative(),
  softCap: z.number().positive(),
  /** True once today's XP is past the soft cap and further XP is reduced. */
  reduced: z.boolean(),
});
export type DailyXp = z.infer<typeof DailyXp>;

export const Coins = z.object({ free: z.number().int().nonnegative(), premium: z.number().int().nonnegative() });
export type Coins = z.infer<typeof Coins>;

export const ComboMultiplier = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type ComboMultiplier = z.infer<typeof ComboMultiplier>;

/** In-match correctness combo: right answers in a row and the XP multiplier they earn. */
export const Combo = z.object({ count: z.number().int().nonnegative(), multiplier: ComboMultiplier });
export type Combo = z.infer<typeof Combo>;

export const RewardAction = z.enum(["prediction", "liveAnswer", "liveResult", "quest", "dev"]);
export type RewardAction = z.infer<typeof RewardAction>;

/** What every rewarded action returns. The client celebrates exactly this. */
export const RewardResult = z.object({
  /** Unique per result; the same idempotency key always returns the same id. */
  id: z.string(),
  action: RewardAction,
  xpGained: z.number().int().nonnegative(),
  coinsGained: z.number().int().nonnegative(),
  totalXp: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  levelUps: z.array(LevelUp),
  newBadges: z.array(Badge),
  streak: StreakUpdate,
  questProgress: z.array(QuestProgress),
  /** The multiplier this action's XP was paid at. */
  comboMultiplier: ComboMultiplier,
  /** The combo after this action (reset to 0 by a wrong answer). */
  combo: Combo,
  dailyXp: DailyXp,
  coins: Coins,
});
export type RewardResult = z.infer<typeof RewardResult>;

export const UserProgress = z.object({
  userId: z.string(),
  totalXp: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  coins: Coins,
  dailyXp: DailyXp,
  streak: Streak,
  combo: Combo,
  pinnedBadges: z.array(z.string()).max(3),
  badgeCount: z.number().int().nonnegative(),
});
export type UserProgress = z.infer<typeof UserProgress>;

/** Every badge there is, earned or not (`earnedAt` null = not yet). Locked ones stay visible. */
export const BadgeCatalog = z.object({ badges: z.array(Badge) });
export type BadgeCatalog = z.infer<typeof BadgeCatalog>;

export const PinResult = z.object({ pinnedBadges: z.array(z.string()).max(3) });
export type PinResult = z.infer<typeof PinResult>;

export const Quest = z.object({
  id: z.string(),
  kind: z.enum(["daily", "weekly", "seasonal", "group"]),
  difficulty: z.enum(["easy", "social", "challenge"]).optional(),
  title: z.string(),
  progress: z.number().int().nonnegative(),
  target: z.number().int().positive(),
  reward: z.object({ xp: z.number().int().nonnegative(), coins: z.number().int().nonnegative() }),
  expiresAt: z.string(),
  requiredLevel: z.number().int().positive(),
  completed: z.boolean(),
});
export type Quest = z.infer<typeof Quest>;

/**
 * The quests open for this user. `serverNow` lets the UI say how long is left
 * without trusting the device clock. Expired quests are simply not in here.
 */
export const QuestBoard = z.object({ quests: z.array(Quest), serverNow: z.string() });
export type QuestBoard = z.infer<typeof QuestBoard>;

export const ShopSlot = z.enum(["kit", "stadium", "boots", "frame", "freeze"]);
export type ShopSlot = z.infer<typeof ShopSlot>;

/** How a cosmetic looks: its two colours (data, like a club's shirt colours). */
export const ItemLook = z.object({ primary: z.string(), secondary: z.string() });
export type ItemLook = z.infer<typeof ItemLook>;

export const ShopItem = z.object({
  id: z.string(),
  slot: ShopSlot,
  name: z.string(),
  detail: z.string().optional(),
  look: ItemLook.optional(),
  /** Price in free coins; `premium` only when premium coins are on. */
  price: z.object({ free: z.number().int().nonnegative(), premium: z.number().int().nonnegative().optional() }),
  requiredLevel: z.number().int().positive(),
  /** Unlocked since you last opened the shop. */
  isNew: z.boolean(),
  owned: z.boolean(),
  equipped: z.boolean(),
});
export type ShopItem = z.infer<typeof ShopItem>;

export const ShopCatalog = z.object({ items: z.array(ShopItem) });
export type ShopCatalog = z.infer<typeof ShopCatalog>;

/** A cosmetic as it appears on a club (yours or a friend's). */
export const ClubItem = z.object({ id: z.string(), name: z.string(), look: ItemLook.optional() });
export type ClubItem = z.infer<typeof ClubItem>;

export const MyClub = z.object({
  userId: z.string(),
  name: z.string(),
  kit: ClubItem.nullable(),
  stadium: ClubItem.nullable(),
  boots: ClubItem.nullable(),
  frame: ClubItem.nullable(),
  pinnedBadges: z.array(Badge).max(3),
  level: z.number().int().positive(),
  tier: TierId,
  streak: z.number().int().nonnegative(),
});
export type MyClub = z.infer<typeof MyClub>;

/** What a purchase did, in the server's numbers. */
export const PurchaseResult = z.object({
  item: ShopItem,
  coins: Coins,
  /** Free coins are spent first, then premium. */
  spent: z.object({ free: z.number().int().nonnegative(), premium: z.number().int().nonnegative() }),
  /** Set when the purchase changed the streak (a freeze). */
  streak: Streak.optional(),
});
export type PurchaseResult = z.infer<typeof PurchaseResult>;

export const EquipResult = z.object({ club: MyClub });
export type EquipResult = z.infer<typeof EquipResult>;

export const LevelCurve = z.object({
  /** Cumulative XP for level L = base·(L−1) + growth·(L−1)(L−2). */
  base: z.number().positive(),
  growth: z.number().nonnegative(),
});
export type LevelCurve = z.infer<typeof LevelCurve>;

/** Every tunable number the UI shows. Served by the config endpoint, never hard-coded in components. */
export const GamificationConfig = z.object({
  maxLevel: z.number().int().positive(),
  curves: z.record(z.string(), LevelCurve),
  tiers: z.array(z.object({ id: TierId, from: z.number().int().positive(), to: z.number().int().positive(), name: z.string() })),
  unlocks: z.record(FeatureId, z.number().int().positive()),
  dailyXp: z.object({ softCap: z.number().positive(), overCapRate: z.number().positive() }),
  streak: z.object({
    milestones: z.array(z.number().int().positive()),
    freezesPerWeek: z.number().int().nonnegative(),
    maxFreezes: z.number().int().nonnegative(),
  }),
  combo: z.array(z.object({ at: z.number().int().positive(), multiplier: ComboMultiplier })),
  quests: z.object({ dailyCount: z.number().int().positive() }),
  pinnedBadgesMax: z.number().int().positive(),
});
export type GamificationConfig = z.infer<typeof GamificationConfig>;

/** A/B flags. Defaults in `flags.ts`; the server decides each user's bucket. */
export const FeatureFlags = z.object({
  dailyQuestCount: z.union([z.literal(2), z.literal(3)]),
  levelUpShareStyle: z.enum(["button", "icon"]),
  /** Key into `GamificationConfig.curves`. */
  levelCurve: z.string(),
  firstKitPrice: z.number().int().nonnegative(),
  premiumCoins: z.boolean(),
});
export type FeatureFlags = z.infer<typeof FeatureFlags>;
