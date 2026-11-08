import type { GamificationConfig, LevelCurve, TierId } from "./schemas";

/**
 * Level math for drawing progress only. The level itself always comes from
 * the server; nothing here decides a level or grants XP.
 */

/** Cumulative XP needed to reach level `level`: base·(L−1) + growth·(L−1)(L−2). */
export function xpForLevel(level: number, curve: LevelCurve): number {
  const l = Math.max(1, Math.floor(level));
  return curve.base * (l - 1) + curve.growth * (l - 1) * (l - 2);
}

export type LevelProgress = {
  /** XP earned inside the current level. */
  into: number;
  /** XP the current level spans (0 at max level). */
  span: number;
  /** 0–1, clamped. 1 at max level. */
  pct: number;
  isMax: boolean;
  /** Cumulative XP at the start of the next level, null at max. */
  nextAt: number | null;
};

/**
 * Where `totalXp` sits inside the server's `level`. If the two disagree (say a
 * curve change mid-session), the bar clamps instead of inventing a level.
 */
export function levelProgress(totalXp: number, level: number, curve: LevelCurve, maxLevel: number): LevelProgress {
  const l = Math.min(Math.max(1, level), maxLevel);
  if (l >= maxLevel) return { into: 0, span: 0, pct: 1, isMax: true, nextAt: null };
  const floor = xpForLevel(l, curve);
  const nextAt = xpForLevel(l + 1, curve);
  const span = nextAt - floor;
  const into = Math.min(Math.max(0, totalXp - floor), span);
  return { into, span, pct: span > 0 ? into / span : 0, isMax: false, nextAt };
}

/** XP still needed from `totalXp` to reach `target` level (0 if already there). */
export function xpToLevel(totalXp: number, target: number, curve: LevelCurve): number {
  return Math.max(0, xpForLevel(target, curve) - totalXp);
}

export function curveFor(config: GamificationConfig, variant: string): LevelCurve {
  return config.curves[variant] ?? config.curves.default ?? Object.values(config.curves)[0];
}

export function tierFor(level: number, config: GamificationConfig): { id: TierId; name: string } {
  const t = config.tiers.find((x) => level >= x.from && level <= x.to) ?? config.tiers[config.tiers.length - 1];
  return { id: t.id, name: t.name };
}
