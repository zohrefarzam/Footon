import type { FeatureId, GamificationConfig } from "./schemas";

/**
 * The core loop is never locked, whatever the config says: predicting,
 * live predictions, your profile, joining a league and the weekly board.
 */
export const CORE_FEATURES: ReadonlySet<FeatureId> = new Set<FeatureId>([
  "predictions",
  "livePredictions",
  "profile",
  "joinLeague",
  "weeklyLeaderboard",
]);

export function requiredLevel(feature: FeatureId, config: GamificationConfig): number {
  if (CORE_FEATURES.has(feature)) return 1;
  return config.unlocks[feature] ?? 1;
}

export function isUnlocked(feature: FeatureId, level: number, config: GamificationConfig): boolean {
  if (CORE_FEATURES.has(feature)) return true;
  return level >= requiredLevel(feature, config);
}

/** Features that open exactly at `level` (for the Level Up screen when the server sends none). */
export function unlocksAt(level: number, config: GamificationConfig): FeatureId[] {
  return (Object.entries(config.unlocks) as [FeatureId, number][])
    .filter(([f, l]) => l === level && !CORE_FEATURES.has(f))
    .map(([f]) => f);
}
