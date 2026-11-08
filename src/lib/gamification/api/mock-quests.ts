/**
 * The MOCK SERVER's quests: templates and how actions move them. Stands in for
 * the backend; nothing in the UI imports it.
 */
import type { Quest, QuestProgress } from "../schemas";

export type QuestEvent =
  | { type: "prediction"; count: number }
  | { type: "liveAnswer" }
  | { type: "liveResult"; correct: boolean; combo: number }
  /** The first real prediction of a match day (the streak ticked). */
  | { type: "matchDay" };

export type QuestTemplate = Omit<Quest, "progress" | "completed" | "expiresAt"> & {
  seed?: number;
  /** New progress after `ev`, from the old one (clamped to target by the engine). */
  step: (ev: QuestEvent, progress: number) => number;
};

export const QUEST_TEMPLATES: QuestTemplate[] = [
  // daily: easy · social · challenge (the A/B flag can drop the last one)
  {
    id: "d-easy",
    kind: "daily",
    difficulty: "easy",
    title: "Make a prediction",
    target: 1,
    reward: { xp: 30, coins: 30 },
    requiredLevel: 1,
    step: (ev, p) => (ev.type === "prediction" && ev.count > 0 ? p + 1 : p),
  },
  {
    id: "d-social",
    kind: "daily",
    difficulty: "social",
    title: "Answer 2 live questions with your league",
    target: 2,
    reward: { xp: 40, coins: 40 },
    requiredLevel: 1,
    step: (ev, p) => (ev.type === "liveAnswer" ? p + 1 : p),
  },
  {
    id: "d-challenge",
    kind: "daily",
    difficulty: "challenge",
    title: "Get 3 right in a row",
    target: 3,
    reward: { xp: 75, coins: 75 },
    requiredLevel: 1,
    // best run today, not a running total
    step: (ev, p) => (ev.type === "liveResult" ? Math.max(p, ev.combo) : p),
  },
  // weekly, from the weekly-quests unlock level
  {
    id: "w-days",
    kind: "weekly",
    title: "Predict on 3 match days",
    target: 3,
    reward: { xp: 150, coins: 150 },
    requiredLevel: 6,
    seed: 1,
    step: (ev, p) => (ev.type === "matchDay" ? p + 1 : p),
  },
  {
    id: "w-right",
    kind: "weekly",
    title: "Get 10 live calls right",
    target: 10,
    reward: { xp: 150, coins: 150 },
    requiredLevel: 6,
    seed: 4,
    step: (ev, p) => (ev.type === "liveResult" && ev.correct ? p + 1 : p),
  },
  // seasonal and group
  {
    id: "s-days",
    kind: "seasonal",
    title: "Play 20 match days this season",
    target: 20,
    reward: { xp: 500, coins: 500 },
    requiredLevel: 1,
    seed: 9,
    step: (ev, p) => (ev.type === "matchDay" ? p + 1 : p),
  },
  {
    id: "g-calls",
    kind: "group",
    title: "Sunday Rivals: 50 calls between you this week",
    target: 50,
    reward: { xp: 200, coins: 200 },
    requiredLevel: 1,
    seed: 31,
    // your own calls; the rest of the league adds theirs on the real server
    step: (ev, p) => (ev.type === "prediction" ? p + ev.count : ev.type === "liveAnswer" ? p + 1 : p),
  },
];

export type QuestState = Record<string, { progress: number; completed: boolean }>;

export const seedQuests = (templates = QUEST_TEMPLATES, only?: (t: QuestTemplate) => boolean): QuestState =>
  Object.fromEntries(templates.filter((t) => !only || only(t)).map((t) => [t.id, { progress: t.seed ?? 0, completed: false }]));

/**
 * Move every active quest by the events. A quest pays once: the first time it
 * reaches its target it's `completedNow` and its reward goes into `bonus`.
 */
export function advanceQuests(
  state: QuestState,
  active: QuestTemplate[],
  events: QuestEvent[],
): { state: QuestState; changes: QuestProgress[]; bonus: { xp: number; coins: number } } {
  const next: QuestState = { ...state };
  const changes: QuestProgress[] = [];
  const bonus = { xp: 0, coins: 0 };
  for (const t of active) {
    const cur = next[t.id] ?? { progress: t.seed ?? 0, completed: false };
    if (cur.completed) continue;
    const progress = Math.min(t.target, events.reduce((p, ev) => t.step(ev, p), cur.progress));
    if (progress === cur.progress) continue;
    const done = progress >= t.target;
    next[t.id] = { progress, completed: done };
    if (done) {
      bonus.xp += t.reward.xp;
      bonus.coins += t.reward.coins;
    }
    changes.push({ questId: t.id, title: t.title, progress, target: t.target, completedNow: done, ...(done ? { reward: t.reward } : {}) });
  }
  return { state: next, changes, bonus };
}
