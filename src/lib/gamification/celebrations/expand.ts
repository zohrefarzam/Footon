import type { Badge, ComboMultiplier, FeatureId, QuestProgress, RewardResult, StreakUpdate, TierId } from "../schemas";

export type Celebration =
  | {
      key: string;
      kind: "xp";
      xpGained: number;
      coinsGained: number;
      /** Server totals before and after, so the bar animates between real values. */
      fromXp: number;
      toXp: number;
      level: number;
      reduced: boolean;
      comboMultiplier: ComboMultiplier;
    }
  | { key: string; kind: "streak"; streak: StreakUpdate }
  | { key: string; kind: "levelUp"; level: number; tier: TierId; tierChanged: boolean; unlocks: FeatureId[]; badge: Badge | null }
  | { key: string; kind: "badge"; badge: Badge }
  | { key: string; kind: "quest"; quest: QuestProgress };

export type CelebrationKind = Celebration["kind"];

/** Only the Level Up screen holds the user; everything else plays and moves on. */
export const isBlocking = (c: Celebration) => c.kind === "levelUp";

/**
 * One server result → the ordered moments to play:
 * +XP → streak tick → Level Up (one per level, ascending, each carrying its
 * level badge) → badge toasts → quest completions.
 * Pure: it never computes a reward, only arranges what the server sent.
 */
export function expandReward(
  result: RewardResult,
  prev: { totalXp: number; level: number } | null,
  tierOf?: (level: number) => TierId,
): Celebration[] {
  const out: Celebration[] = [];
  const k = (kind: string, i = 0) => `${result.id}:${kind}:${i}`;

  if (result.xpGained > 0) {
    out.push({
      key: k("xp"),
      kind: "xp",
      xpGained: result.xpGained,
      coinsGained: result.coinsGained,
      fromXp: prev?.totalXp ?? result.totalXp - result.xpGained,
      toXp: result.totalXp,
      level: result.level,
      reduced: result.dailyXp.reduced,
      comboMultiplier: result.comboMultiplier,
    });
  }

  const st = result.streak;
  if (st.incrementedNow || st.milestone !== null || st.freezeUsed) out.push({ key: k("streak"), kind: "streak", streak: st });

  const levelBadges = new Map(result.newBadges.filter((b) => b.family === "level" && b.level !== undefined).map((b) => [b.level!, b]));
  const ups = [...result.levelUps].sort((a, b) => a.level - b.level);
  ups.forEach((u, i) => {
    const badge = u.badge ?? levelBadges.get(u.level) ?? null;
    if (badge?.level !== undefined) levelBadges.delete(badge.level);
    const before = i > 0 ? ups[i - 1].tier : tierOf ? tierOf(prev?.level ?? u.level - 1) : u.tier;
    out.push({ key: k("levelUp", u.level), kind: "levelUp", level: u.level, tier: u.tier, tierChanged: before !== u.tier, unlocks: u.unlocks, badge });
  });

  // every other badge is a toast; a level badge with no matching screen is never dropped
  const shown = new Set(out.flatMap((c) => (c.kind === "levelUp" && c.badge ? [c.badge.id] : [])));
  result.newBadges
    .filter((b) => !shown.has(b.id))
    .forEach((b, i) => out.push({ key: k("badge", i), kind: "badge", badge: b }));

  result.questProgress.filter((q) => q.completedNow).forEach((q, i) => out.push({ key: k("quest", i), kind: "quest", quest: q }));

  return out;
}
