/**
 * In-memory MOCK SERVER for the gamification API. It owns the state and
 * applies the rules (via `mock-rules.ts`) the way the backend will, so the UI
 * can be built against real-shaped results. State lives in memory and resets
 * on a full reload.
 *
 * `dev` controls (offline, forced failures, XP grants) drive the styleguide's
 * demo panel and the tests. They don't exist on the real API.
 */
import { mockConfig, defaultFlags } from "../config";
import { matchDayKey } from "../day";
import { curveFor, tierFor } from "../level";
import { toStreak, type Badge, type FeatureFlags, type GamificationConfig, type RewardAction, type RewardResult, type Streak, type UserProgress } from "../schemas";
import { ApiError, type ApiErrorCode, type GamificationApi, type LiveAnswerInput, type PredictionInput } from "./client";
import { cappedXp, levelFromXp, levelUpsBetween, streakOnPrediction, streakStatusOn } from "./mock-rules";

/** Mock server's reward table (the backend owns the real one). */
const XP_PER_PREDICTION = 20;
const XP_PER_LIVE_ANSWER = 15;

const LEVEL_BADGE_RARITY: Record<number, number> = { 5: 38, 10: 14, 15: 6, 20: 2.5, 25: 0.8, 30: 0.1 };

export type MockState = {
  totalXp: number;
  coins: { free: number; premium: number };
  daily: { dayKey: string; earned: number };
  streak: Streak;
  combo: number;
  badges: Badge[];
  pinned: string[];
};

export type MockOptions = {
  latencyMs?: number;
  config?: GamificationConfig;
  flags?: FeatureFlags;
  /** Fixtures with their kickoff instants: the match days behind the streak's "missed day" rule. */
  fixtures?: { kickoff: string }[];
  initial?: Partial<MockState>;
  now?: () => Date;
};

export type MockDevControls = {
  setOffline(offline: boolean): void;
  /** The next call fails with this code (once). */
  failNext(code: ApiErrorCode): void;
  /** Server-side XP grant, for demoing multi-level-ups. Returns a real-shaped result. */
  grantXp(xp: number): Promise<RewardResult>;
  state(): MockState;
  reset(): void;
};

export type MockGamificationApi = GamificationApi & { dev: MockDevControls };

function levelBadge(level: number, config: GamificationConfig): Badge | null {
  if (!(level in LEVEL_BADGE_RARITY)) return null;
  return {
    id: `level-${level}`,
    family: "level",
    name: `${tierFor(level, config).name}`,
    icon: tierFor(level, config).id,
    rarityPct: LEVEL_BADGE_RARITY[level],
    level,
    earnedAt: null,
  };
}

export function createMockApi(opts: MockOptions = {}): MockGamificationApi {
  const config = opts.config ?? mockConfig;
  const flags = opts.flags ?? defaultFlags;
  const curve = curveFor(config, flags.levelCurve);
  const now = opts.now ?? (() => new Date());
  const latency = opts.latencyMs ?? 350;

  const seed = (): MockState => ({
    totalXp: 1640, // level 7, 290 of 400 into it
    coins: { free: 6450, premium: 0 },
    daily: { dayKey: "", earned: 240 },
    streak: { current: 3, best: 6, lastDayKey: null, freezesHeld: 1, status: "active" },
    combo: 0,
    badges: [
      { ...levelBadge(5, config)!, earnedAt: "2026-10-20T19:00:00Z" },
      { id: "first-win", family: "achievement", name: "First win", icon: "trophy", rarityPct: 71, earnedAt: "2026-10-12T21:00:00Z" },
      { id: "prophet", family: "achievement", name: "Prophet", icon: "eye", rarityPct: 9.5, earnedAt: "2026-10-28T20:40:00Z" },
    ],
    pinned: ["prophet"],
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

  const matchDays = (tz: string) =>
    [...new Set((opts.fixtures ?? []).map((f) => matchDayKey(f.kickoff, tz)))].sort();

  function progress(tz = "UTC"): UserProgress {
    rollDay(tz);
    const level = levelFromXp(s.totalXp, curve, config.maxLevel);
    return {
      userId: "me",
      totalXp: s.totalXp,
      level,
      coins: s.coins,
      dailyXp: dailyXp(),
      streak: streakStatusOn(s.streak, matchDayKey(now(), tz), matchDays(tz)),
      combo: { count: s.combo, multiplier: comboMultiplier() },
      pinnedBadges: s.pinned,
      badgeCount: s.badges.length,
    };
  }

  function rollDay(tz: string) {
    const today = matchDayKey(now(), tz);
    if (s.daily.dayKey === "") s.daily.dayKey = today; // seed counts as today's
    if (s.daily.dayKey !== today) s.daily = { dayKey: today, earned: 0 };
  }

  const dailyXp = () => ({
    earned: s.daily.earned,
    softCap: config.dailyXp.softCap,
    reduced: s.daily.earned >= config.dailyXp.softCap,
  });

  function comboMultiplier(): 1 | 2 | 3 {
    let m: 1 | 2 | 3 = 1;
    for (const step of config.combo) if (s.combo >= step.at) m = step.multiplier;
    return m;
  }

  /** Apply one rewarded action and build its result. */
  function reward(action: RewardAction, baseXp: number, coins: number, tz: string, dayKey: string | null): RewardResult {
    rollDay(tz);
    const multiplier = comboMultiplier();
    // dev grants skip the cap so a demo can land on an exact level
    const xpGained =
      action === "dev" ? baseXp : cappedXp(baseXp * multiplier, s.daily.earned, config.dailyXp.softCap, config.dailyXp.overCapRate);
    const before = levelFromXp(s.totalXp, curve, config.maxLevel);
    s.totalXp += xpGained;
    if (action !== "dev") s.daily.earned += xpGained;
    s.coins = { ...s.coins, free: s.coins.free + coins };
    const level = levelFromXp(s.totalXp, curve, config.maxLevel);

    const levelUps = levelUpsBetween(before, level, config, (l) => {
      const b = levelBadge(l, config);
      return b && !s.badges.some((x) => x.id === b.id) ? { ...b, earnedAt: now().toISOString() } : null;
    });
    const newBadges = levelUps.flatMap((u) => (u.badge ? [u.badge] : []));
    s.badges.push(...newBadges);

    const streak = dayKey
      ? streakOnPrediction(streakStatusOn(s.streak, dayKey, matchDays(tz)), dayKey, matchDays(tz), config.streak.milestones)
      : { ...s.streak, incrementedNow: false, milestone: null, freezeUsed: false };
    s.streak = toStreak(streak);

    return {
      id: `rr_${++seq}_${now().getTime()}`,
      action,
      xpGained,
      coinsGained: coins,
      totalXp: s.totalXp,
      level,
      levelUps,
      newBadges,
      streak,
      questProgress: [],
      comboMultiplier: multiplier,
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
    getProgress: () => respond(() => progress(typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC")),
    submitPrediction: (i: PredictionInput) =>
      respond(() =>
        once(i.idempotencyKey, () => {
          const fresh = Math.max(0, i.count - (rewardedPredictions.get(i.matchId) ?? 0));
          rewardedPredictions.set(i.matchId, Math.max(i.count, rewardedPredictions.get(i.matchId) ?? 0));
          return reward("prediction", XP_PER_PREDICTION * fresh, XP_PER_PREDICTION * fresh, i.timeZone, matchDayKey(i.kickoff, i.timeZone));
        }),
      ),
    answerLiveQuestion: (i: LiveAnswerInput) =>
      respond(() =>
        once(i.idempotencyKey, () => reward("liveAnswer", XP_PER_LIVE_ANSWER, XP_PER_LIVE_ANSWER, i.timeZone, matchDayKey(i.kickoff, i.timeZone))),
      ),
    dev: {
      setOffline: (o) => void (offline = o),
      failNext: (c) => void (failCode = c),
      grantXp: (xp) => respond(() => reward("dev", xp, 0, "UTC", null)),
      state: () => structuredClone(s),
      reset: () => {
        s = seed();
        seen.clear();
        rewardedPredictions.clear();
        offline = false;
        failCode = null;
      },
    },
  };
}
