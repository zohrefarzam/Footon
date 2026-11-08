/**
 * In-memory MOCK SERVER for the gamification API. It owns the state and
 * applies the rules (via `mock-rules.ts`) the way the backend will, so the UI
 * can be built against real-shaped results. State lives in memory and resets
 * on a full reload.
 *
 * `dev` controls (offline, forced failures, XP grants, resolving live
 * questions, breaking the streak) drive the styleguide's demo panel and the
 * tests. They don't exist on the real API: there, live results are pushed by
 * the server and land through the same `applyReward()`.
 */
import { mockConfig, defaultFlags } from "../config";
import { matchDayKey } from "../day";
import { curveFor, tierFor } from "../level";
import {
  toStreak,
  type Badge,
  type BadgeCatalog,
  type ClubItem,
  type MyClub,
  type PurchaseResult,
  type Quest,
  type QuestBoard,
  type ShopItem,
  type ShopSlot,
  type FeatureFlags,
  type GamificationConfig,
  type RewardAction,
  type RewardResult,
  type Streak,
  type StreakUpdate,
  type UserProgress,
} from "../schemas";
import { ApiError, type ApiErrorCode, type GamificationApi, type LiveAnswerInput, type PredictionInput, type PurchaseInput } from "./client";
import { CATALOG as SHOP, FRIEND_CLUBS, type CatalogItem } from "./mock-shop";
import { advanceQuests, QUEST_TEMPLATES, seedQuests, type QuestEvent, type QuestState, type QuestTemplate } from "./mock-quests";
import { cappedXp, comboMultiplierFor, levelFromXp, levelUpsBetween, streakOnPrediction, streakStatusOn } from "./mock-rules";

/** Mock server's reward table (the backend owns the real one). */
const XP_PER_PREDICTION = 20;
const XP_PER_LIVE_ANSWER = 15;
const XP_PER_RIGHT_ANSWER = 25;

const LEVEL_BADGE_RARITY: Record<number, number> = { 5: 38, 10: 14, 15: 6, 20: 2.5, 25: 0.8, 30: 0.1 };

/** Every non-level badge the mock server knows. Earned state lives in `MockState.earned`. */
const CATALOG: Omit<Badge, "earnedAt">[] = [
  { id: "first-win", family: "achievement", name: "First win", description: "Your first right call", icon: "trophy", tier: "gold", rarityPct: 71 },
  { id: "prophet", family: "achievement", name: "Prophet", description: "Called a 0–0 before kickoff", icon: "eye", tier: "standard", rarityPct: 9.5 },
  { id: "hat-trick", family: "achievement", name: "Hat-trick", description: "3 right in a row in one match", icon: "flame", tier: "standard", rarityPct: 22 },
  { id: "perfect-five", family: "achievement", name: "Perfect five", description: "5 right in a row in one match", icon: "flame", tier: "gold", rarityPct: 4.2 },
  { id: "streak-7", family: "achievement", name: "Week in", description: "7 match days in a row", icon: "calendar", tier: "standard", rarityPct: 12 },
  { id: "streak-30", family: "achievement", name: "Season ticket", description: "30 match days in a row", icon: "calendar", tier: "gold", rarityPct: 0.9 },
  { id: "league-founder", family: "social", name: "Founder", description: "Started a league", icon: "users", tier: "standard", rarityPct: 18 },
  { id: "first-invite", family: "social", name: "Plus one", description: "A friend joined from your invite", icon: "handshake", tier: "standard", rarityPct: 27 },
  { id: "autumn-2026", family: "seasonal", name: "Autumn 2026", description: "Played a match day this autumn", icon: "leaf", tier: "standard", rarityPct: 41 },
];

export type MockState = {
  totalXp: number;
  coins: { free: number; premium: number };
  daily: { dayKey: string; earned: number };
  streak: Streak;
  combo: number;
  /** Badge id → earnedAt. */
  earned: Record<string, string>;
  pinned: string[];
  quests: QuestState;
  /** Shop: what you own, what's on your club, and the level you last opened the shop at. */
  owned: string[];
  equipped: Record<Exclude<ShopSlot, "freeze">, string | null>;
  shopSeenLevel: number;
};

export type MockOptions = {
  latencyMs?: number;
  config?: GamificationConfig;
  flags?: FeatureFlags;
  /** Fixtures with their kickoff instants: the match days behind the streak's "missed day" rule. */
  fixtures?: { kickoff: string }[];
  initial?: Partial<MockState>;
  now?: () => Date;
  /** Quest templates the server runs (default: all). Tests pass [] to leave quests out. */
  quests?: QuestTemplate[];
};

export type MockDevControls = {
  setOffline(offline: boolean): void;
  /** The next call fails with this code (once). */
  failNext(code: ApiErrorCode): void;
  /** Server-side XP grant, for demoing multi-level-ups. Returns a real-shaped result. */
  grantXp(xp: number): Promise<RewardResult>;
  /** The server settling a live question you answered: right extends the combo, wrong resets it. */
  resolveLiveQuestion(correct: boolean): Promise<RewardResult>;
  /** Pretend match days went by without a prediction and no freeze covered them. */
  breakStreak(): void;
  /** The day rolls over: today's quests expire silently and a fresh set opens. */
  expireDailyQuests(): void;
  state(): MockState;
  reset(): void;
};

export type MockGamificationApi = GamificationApi & { dev: MockDevControls };

function levelBadge(level: number, config: GamificationConfig): Omit<Badge, "earnedAt"> | null {
  if (!(level in LEVEL_BADGE_RARITY)) return null;
  const tier = tierFor(level, config);
  return {
    id: `level-${level}`,
    family: "level",
    name: tier.name,
    description: `Reached level ${level}`,
    icon: tier.id,
    // the top two tiers are trophy moments
    tier: level >= 25 ? "gold" : "standard",
    rarityPct: LEVEL_BADGE_RARITY[level],
    level,
  };
}

export function createMockApi(opts: MockOptions = {}): MockGamificationApi {
  const config = opts.config ?? mockConfig;
  const flags = opts.flags ?? defaultFlags;
  const curve = curveFor(config, flags.levelCurve);
  const now = opts.now ?? (() => new Date());
  const latency = opts.latencyMs ?? 350;
  const templates = opts.quests ?? QUEST_TEMPLATES;

  const catalog: Omit<Badge, "earnedAt">[] = [
    ...Object.keys(LEVEL_BADGE_RARITY).map((l) => levelBadge(Number(l), config)!),
    ...CATALOG,
  ];

  const seed = (): MockState => ({
    totalXp: 1640, // level 7, 290 of 400 into it
    coins: { free: 6450, premium: 0 },
    daily: { dayKey: "", earned: 240 },
    streak: { current: 3, best: 6, lastDayKey: null, freezesHeld: 1, status: "active" },
    combo: 0,
    earned: { "level-5": "2026-10-20T19:00:00Z", "first-win": "2026-10-12T21:00:00Z", prophet: "2026-10-28T20:40:00Z" },
    pinned: ["prophet"],
    quests: seedQuests(templates),
    owned: ["kit-academy"],
    equipped: { kit: "kit-academy", stadium: null, boots: null, frame: null },
    shopSeenLevel: 4,
    ...opts.initial,
  });
  let s = seed();
  let offline = false;
  let failCode: ApiErrorCode | null = null;
  const seen = new Map<string, RewardResult>();
  // predictions already rewarded per match: re-locking an edited slip pays only for new ones
  const rewardedPredictions = new Map<string, number>();
  let seq = 0;

  async function respond<T>(fn: () => T): Promise<T> {
    if (latency > 0) await new Promise((r) => setTimeout(r, latency));
    if (offline) throw new ApiError("offline");
    if (failCode) {
      const c = failCode;
      failCode = null;
      throw new ApiError(c);
    }
    // structured clone so callers can't mutate server state
    return structuredClone(fn());
  }

  const tzNow = () => (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC");
  const matchDays = (tz: string) => [...new Set((opts.fixtures ?? []).map((f) => matchDayKey(f.kickoff, tz)))].sort();
  const badge = (id: string): Badge => ({ ...catalog.find((b) => b.id === id)!, earnedAt: s.earned[id] ?? null });

  /** Awards a badge once; null if already held or unknown. */
  function award(id: string): Badge | null {
    if (s.earned[id] || !catalog.some((b) => b.id === id)) return null;
    s.earned[id] = now().toISOString();
    return badge(id);
  }

  const levelNow = () => levelFromXp(s.totalXp, curve, config.maxLevel);
  const unlockLevel = (c: CatalogItem) => (typeof c.unlock === "number" ? c.unlock : config.unlocks[c.unlock]);
  const priceOf = (c: CatalogItem) => (c.price === "firstKit" ? flags.firstKitPrice : c.price);

  function toItem(c: CatalogItem): ShopItem {
    const req = unlockLevel(c);
    const owned = s.owned.includes(c.id);
    return {
      id: c.id,
      slot: c.slot,
      name: c.name,
      ...(c.detail ? { detail: c.detail } : {}),
      ...(c.look ? { look: c.look } : {}),
      // premium prices only exist while premium coins are switched on
      price: { free: priceOf(c), ...(flags.premiumCoins ? { premium: Math.ceil(priceOf(c) / 10) } : {}) },
      requiredLevel: req,
      isNew: levelNow() >= req && req > s.shopSeenLevel && !owned,
      owned,
      equipped: c.slot !== "freeze" && s.equipped[c.slot] === c.id,
    };
  }

  const clubItem = (id: string | null | undefined): ClubItem | null => {
    const c = SHOP.find((x) => x.id === id);
    return c ? { id: c.id, name: c.name, ...(c.look ? { look: c.look } : {}) } : null;
  };

  function club(userId = "me"): MyClub {
    if (userId === "me") {
      const level = levelNow();
      const st = streakStatusOn(s.streak, matchDayKey(now(), tzNow()), matchDays(tzNow()));
      return {
        userId: "me",
        name: "Your club",
        kit: clubItem(s.equipped.kit),
        stadium: clubItem(s.equipped.stadium),
        boots: clubItem(s.equipped.boots),
        frame: clubItem(s.equipped.frame),
        pinnedBadges: s.pinned.map(badge),
        level,
        tier: tierFor(level, config).id,
        streak: st.status === "active" ? st.current : 0,
      };
    }
    const f = FRIEND_CLUBS[userId];
    if (!f) throw new ApiError("server", "No such club");
    return {
      userId,
      name: f.name,
      kit: clubItem(f.kit),
      stadium: clubItem(f.stadium),
      boots: clubItem(f.boots),
      frame: clubItem(f.frame),
      pinnedBadges: f.badges.map((id) => ({ ...badge(id), earnedAt: "2026-10-01T00:00:00Z" })),
      level: f.level,
      tier: tierFor(f.level, config).id,
      streak: f.streak,
    };
  }

  const purchases = new Map<string, PurchaseResult>();

  function purchase(i: PurchaseInput): PurchaseResult {
    const hit = purchases.get(i.idempotencyKey);
    if (hit) return hit;
    const c = SHOP.find((x) => x.id === i.itemId);
    if (!c || levelNow() < unlockLevel(c)) throw new ApiError("conflict", "Not unlocked");
    if (c.slot !== "freeze" && s.owned.includes(c.id)) throw new ApiError("conflict", "Already yours");
    if (c.slot === "freeze" && s.streak.freezesHeld >= config.streak.maxFreezes) throw new ApiError("conflict", "Freezes full");
    const price = priceOf(c);
    if (price !== i.price) throw new ApiError("conflict", "Price changed");
    const premium = flags.premiumCoins ? s.coins.premium : 0;
    if (s.coins.free + premium < price) throw new ApiError("insufficient_balance");
    // free coins go first, premium only covers the rest
    const spent = { free: Math.min(s.coins.free, price), premium: Math.max(0, price - s.coins.free) };
    s.coins = { free: s.coins.free - spent.free, premium: s.coins.premium - spent.premium };
    if (c.slot === "freeze") s.streak = { ...s.streak, freezesHeld: s.streak.freezesHeld + 1 };
    else s.owned = [...s.owned, c.id];
    const r: PurchaseResult = { item: toItem(c), coins: s.coins, spent, ...(c.slot === "freeze" ? { streak: s.streak } : {}) };
    purchases.set(i.idempotencyKey, r);
    return r;
  }

  function progress(tz: string): UserProgress {
    rollDay(tz);
    return {
      userId: "me",
      totalXp: s.totalXp,
      level: levelFromXp(s.totalXp, curve, config.maxLevel),
      coins: s.coins,
      dailyXp: dailyXp(),
      streak: streakStatusOn(s.streak, matchDayKey(now(), tz), matchDays(tz)),
      combo: { count: s.combo, multiplier: comboMultiplierFor(s.combo, config.combo) },
      pinnedBadges: s.pinned,
      badgeCount: Object.keys(s.earned).length,
    };
  }

  function rollDay(tz: string) {
    const today = matchDayKey(now(), tz);
    if (s.daily.dayKey === "") s.daily.dayKey = today; // seed counts as today's
    if (s.daily.dayKey !== today) {
      s.daily = { dayKey: today, earned: 0 };
      resetDaily();
    }
  }

  function resetDaily() {
    s.quests = { ...s.quests, ...seedQuests(templates, (t) => t.kind === "daily") };
  }

  /** Quests open at `level`: the flag's number of dailies, weeklies from their unlock, seasonal and group. */
  function activeQuests(level: number): QuestTemplate[] {
    const daily = templates.filter((t) => t.kind === "daily").slice(0, flags.dailyQuestCount);
    const rest = templates.filter((t) => t.kind !== "daily" && (t.kind !== "weekly" || level >= config.unlocks.weeklyQuests));
    return [...daily, ...rest];
  }

  function expiresAt(kind: Quest["kind"]): string {
    const d = now();
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));
    if (kind === "daily") return end.toISOString();
    if (kind === "seasonal") return `${d.getUTCFullYear()}-12-31T23:59:59Z`;
    // weekly and group: next Monday 00:00 UTC
    end.setUTCDate(end.getUTCDate() + ((8 - end.getUTCDay()) % 7));
    return end.toISOString();
  }

  const toQuest = (t: QuestTemplate): Quest => {
    const st = s.quests[t.id] ?? { progress: t.seed ?? 0, completed: false };
    return {
      id: t.id,
      kind: t.kind,
      ...(t.difficulty ? { difficulty: t.difficulty } : {}),
      title: t.title,
      progress: st.progress,
      target: t.target,
      reward: t.reward,
      expiresAt: expiresAt(t.kind),
      requiredLevel: t.requiredLevel,
      completed: st.completed,
    };
  };

  const dailyXp = () => ({ earned: s.daily.earned, softCap: config.dailyXp.softCap, reduced: s.daily.earned >= config.dailyXp.softCap });

  /**
   * Apply one rewarded action and build its result. `multiplier` is the combo
   * multiplier for this action (live results only); the daily cap applies
   * after it.
   */
  function reward(
    action: RewardAction,
    baseXp: number,
    coins: number,
    tz: string,
    dayKey: string | null,
    events: QuestEvent[] = [],
    multiplier: 1 | 2 | 3 = 1,
    extraBadges: (Badge | null)[] = [],
  ): RewardResult {
    rollDay(tz);

    let streak: StreakUpdate = { ...s.streak, incrementedNow: false, milestone: null, freezeUsed: false };
    if (dayKey) {
      streak = streakOnPrediction(streakStatusOn(s.streak, dayKey, matchDays(tz)), dayKey, matchDays(tz), config.streak.milestones);
      if (streak.milestone === 7) extraBadges.push(award("streak-7"));
      if (streak.milestone === 30) extraBadges.push(award("streak-30"));
    }
    s.streak = toStreak(streak);

    const before = levelFromXp(s.totalXp, curve, config.maxLevel);
    const quests = advanceQuests(s.quests, activeQuests(before), streak.incrementedNow ? [...events, { type: "matchDay" }] : events);
    s.quests = quests.state;

    // dev grants skip the cap so a demo can land on an exact level; quest rewards are paid in full
    const earned = action === "dev" ? baseXp : cappedXp(baseXp * multiplier, s.daily.earned, config.dailyXp.softCap, config.dailyXp.overCapRate);
    const xpGained = earned + quests.bonus.xp;
    const coinsGained = coins + quests.bonus.coins;
    s.totalXp += xpGained;
    if (action !== "dev") s.daily.earned += earned;
    s.coins = { ...s.coins, free: s.coins.free + coinsGained };
    const level = levelFromXp(s.totalXp, curve, config.maxLevel);

    const levelUps = levelUpsBetween(before, level, config, (l) => (levelBadge(l, config) ? award(`level-${l}`) : null));
    const newBadges = [...levelUps.flatMap((u) => (u.badge ? [u.badge] : [])), ...extraBadges.filter((b): b is Badge => b !== null)];

    return {
      id: `rr_${++seq}_${now().getTime()}`,
      action,
      xpGained,
      coinsGained,
      totalXp: s.totalXp,
      level,
      levelUps,
      newBadges,
      streak,
      questProgress: quests.changes,
      comboMultiplier: multiplier,
      combo: { count: s.combo, multiplier: comboMultiplierFor(s.combo, config.combo) },
      dailyXp: dailyXp(),
      coins: s.coins,
    };
  }

  /** Same idempotency key → same result, and the action applies once. */
  function once(key: string, make: () => RewardResult): RewardResult {
    const hit = seen.get(key);
    if (hit) return hit;
    const r = make();
    seen.set(key, r);
    return r;
  }

  return {
    getConfig: () => respond(() => config),
    getFlags: () => respond(() => flags),
    getProgress: () => respond(() => progress(tzNow())),
    submitPrediction: (i: PredictionInput) =>
      respond(() =>
        once(i.idempotencyKey, () => {
          const fresh = Math.max(0, i.count - (rewardedPredictions.get(i.matchId) ?? 0));
          rewardedPredictions.set(i.matchId, Math.max(i.count, rewardedPredictions.get(i.matchId) ?? 0));
          return reward("prediction", XP_PER_PREDICTION * fresh, XP_PER_PREDICTION * fresh, i.timeZone, matchDayKey(i.kickoff, i.timeZone), [
            { type: "prediction", count: fresh },
          ]);
        }),
      ),
    answerLiveQuestion: (i: LiveAnswerInput) =>
      respond(() =>
        once(i.idempotencyKey, () =>
          reward("liveAnswer", XP_PER_LIVE_ANSWER, XP_PER_LIVE_ANSWER, i.timeZone, matchDayKey(i.kickoff, i.timeZone), [{ type: "liveAnswer" }]),
        ),
      ),
    getQuests: () =>
      respond((): QuestBoard => {
        rollDay(tzNow());
        return { quests: activeQuests(levelFromXp(s.totalXp, curve, config.maxLevel)).map(toQuest), serverNow: now().toISOString() };
      }),
    getShop: () => respond(() => ({ items: SHOP.map(toItem) })),
    markShopSeen: () =>
      respond(() => {
        s.shopSeenLevel = levelNow();
        return { ok: true as const };
      }),
    purchase: (i) => respond(() => purchase(i)),
    equip: (itemId) =>
      respond(() => {
        const c = SHOP.find((x) => x.id === itemId);
        if (!c || c.slot === "freeze" || !s.owned.includes(itemId)) throw new ApiError("conflict", "Not yours to wear");
        s.equipped = { ...s.equipped, [c.slot]: itemId };
        return { club: club() };
      }),
    getMyClub: (userId) => respond(() => club(userId)),
    getBadges: () => respond((): BadgeCatalog => ({ badges: catalog.map((b) => badge(b.id)) })),
    pinBadges: (ids: string[]) =>
      respond(() => {
        const unique = [...new Set(ids)];
        if (unique.length > config.pinnedBadgesMax || unique.some((id) => !s.earned[id])) throw new ApiError("conflict");
        s.pinned = unique;
        return { pinnedBadges: s.pinned };
      }),
    dev: {
      setOffline: (o) => void (offline = o),
      failNext: (c) => void (failCode = c),
      grantXp: (xp) => respond(() => reward("dev", xp, 0, "UTC", null)),
      resolveLiveQuestion: (correct) =>
        respond(() => {
          if (!correct) {
            s.combo = 0;
            return reward("liveResult", 0, 0, tzNow(), null, [{ type: "liveResult", correct: false, combo: 0 }]);
          }
          s.combo += 1;
          const badges = [s.combo === 3 ? award("hat-trick") : null, s.combo === 5 ? award("perfect-five") : null];
          const events: QuestEvent[] = [{ type: "liveResult", correct: true, combo: s.combo }];
          return reward("liveResult", XP_PER_RIGHT_ANSWER, XP_PER_RIGHT_ANSWER, tzNow(), null, events, comboMultiplierFor(s.combo, config.combo), badges);
        }),
      breakStreak: () => {
        const days = matchDays(tzNow());
        const today = matchDayKey(now(), tzNow());
        const earlier = days.filter((d) => d < today);
        // last counted day = before every match day we have, so all of them were missed
        const first = earlier[0] ?? today;
        const d = new Date(`${first}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() - 3);
        s.streak = { ...s.streak, current: Math.max(s.streak.current, 6), best: Math.max(s.streak.best, 6), lastDayKey: d.toISOString().slice(0, 10), freezesHeld: 0, status: "active" };
      },
      expireDailyQuests: () => resetDaily(),
      state: () => structuredClone(s),
      reset: () => {
        s = seed();
        seen.clear();
        rewardedPredictions.clear();
        purchases.clear();
        offline = false;
        failCode = null;
      },
    },
  };
}
