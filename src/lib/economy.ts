/**
 * Footon's in-game economy: the fixed rules every coin screen reads from.
 * Source: "Footon internal economy" (strategy doc). Keep the numbers here so the
 * UI never hard-codes a price, a cap or a split.
 *
 * Three things never mix:
 *   points — skill. Only right calls earn them. Rank and prizes use points only.
 *   coins  — play money. Earned (missions, play, invites) or bought. Pays entries,
 *            leagues, moments and looks. Never cashed out, never sent to anyone.
 *   prizes — real things from a sponsor or from us, by weekly/monthly rank.
 */

/** Coin table entry, per player per match. The cap is the top tier. */
export const ENTRY_TIERS = [500, 1500, 2500] as const;
export type EntryTier = (typeof ENTRY_TIERS)[number];

/** Share of every pool that is burned (a coin sink, not our revenue). */
export const POOL_BURN = 0.05;
/** From this many players the pool splits 70 / 30; below it the winner takes it all. */
export const SPLIT_FROM = 5;
export const SPLIT = [0.7, 0.3] as const;

/** Free table: always open on every match. Coins to the top three, capped weekly. */
export const FREE_TABLE_REWARDS = [400, 300, 200] as const;
export const FREE_TABLE_WEEKLY_CAP = 2000;

export const COSTS = {
  createLeague: 1500,
  chatQuestion: 250,
} as const;

/**
 * Predictions (Win / draw, Goals, Cards…) each carry a coin stake. The player
 * picks the amount, at least this minimum, unless the challenge fixed it.
 */
export const PREDICTION_MIN_STAKE = {
  score: 100,
  result: 100,
  goals: 100,
  corners: 100,
  yellows: 100,
  red: 200,
  penalty: 200,
} as const satisfies Record<string, number>;

/** Quick-pick stakes under the amount field. */
export const STAKE_STEPS = [100, 250, 500, 1000] as const;

/** A right prediction pays back this many times its stake (stake included). */
export const PAYOUT_MULTIPLIER = 2;
/** Big matches (`match.boost`) multiply what a right prediction pays again. */
export const BOOST_MULTIPLIER = 2;
/** Points for a right call. Skill only, never boosted, never bought. */
export const POINTS_PER_RIGHT_CALL = 50;

/** Coins a right prediction pays: `payout(250)` → 500, on a 2x match → 1,000. */
export const payout = (stake: number, boosted = false) => stake * PAYOUT_MULTIPLIER * (boosted ? BOOST_MULTIPLIER : 1);

/** Every coin starter missions can pay out over the first seven days. */
export const STARTER_TOTAL = 15000;
export const STARTER_DAYS = 7;

export type PoolSplit = {
  pool: number;
  burned: number;
  /** Payouts by finishing place: [winner] or [1st, 2nd]. */
  payouts: number[];
};

/**
 * How one match pool pays out. Ties share their places equally (handled where
 * results settle, not here).
 *   4 × 1,500 → pool 6,000, 300 burned, winner 5,700
 *   7 × 500   → pool 3,500, 175 burned, 2,327 / 998
 */
export function splitPool(entry: number, players: number): PoolSplit {
  const pool = entry * players;
  const burned = Math.round(pool * POOL_BURN);
  const net = pool - burned;
  if (players < SPLIT_FROM) return { pool, burned, payouts: [net] };
  const first = Math.floor(net * SPLIT[0]);
  return { pool, burned, payouts: [first, net - first] };
}

/** `10,000`: coins never show decimals. */
export const formatCoins = (n: number) => Math.round(n).toLocaleString("en-US");

/** `+1,500` / `−500` with a real minus sign. */
export const formatDelta = (n: number) => `${n < 0 ? "−" : "+"}${formatCoins(Math.abs(n))}`;
