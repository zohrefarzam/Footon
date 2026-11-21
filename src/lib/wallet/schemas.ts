/**
 * Wallet screen data from the backend (gamification `/wallet/missions`,
 * `/wallet/earn-rules`, wallet `/wallet/activity`), parsed here and adapted to
 * the shapes the wallet UI already draws (`Mission`, `earnWays`, `CoinEntry`).
 * Counts can arrive as numbers or digit strings, so they are coerced.
 */
import { z } from "zod";

import type { CoinEntry, Mission } from "@/lib/mock-data";

const n = z.coerce.number();

export const MissionsResponse = z.object({
  starter: z.object({
    day: n,
    items: z.array(z.object({ id: z.string(), title: z.string(), status: z.string(), reward: n, done: z.boolean() })),
  }),
  weekly: z.array(z.object({ title: z.string(), progress: n, target: n, reward: n })),
  caps: z.array(z.object({ label: z.string(), earned: n, cap: n, period: z.string() })),
});

export const EarnRules = z.array(z.object({ title: z.string(), condition: z.string(), cap: z.string(), reward: z.string() }));

export const ActivityPage = z.object({
  items: z.array(z.object({ id: z.coerce.string(), title: z.string(), at: z.string(), context: z.string(), amount: n })),
});

export type WalletData = {
  starter: { day: number; missions: Mission[] };
  weekly: {
    mission: { title: string; done: number; total: number; coins: number } | null;
    caps: { id: string; label: string; used: number; cap: number; period: string }[];
  };
  earnWays: { id: string; label: string; detail: string; coins: number; cap: string }[];
  activity: CoinEntry[];
};

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("fa-IR", { weekday: "long", day: "numeric", month: "long" });

/** The first number in a reward written as text ("400 / 300 / 200" → 400). */
const firstNumber = (s: string) => Number(s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).match(/\d+/)?.[0] ?? 0);

export function toWalletData(
  missions: z.infer<typeof MissionsResponse>,
  rules: z.infer<typeof EarnRules>,
  activity: z.infer<typeof ActivityPage>,
): WalletData {
  const w = missions.weekly[0];
  return {
    starter: {
      day: missions.starter.day,
      missions: missions.starter.items.map((m) => ({
        id: m.id,
        title: m.title,
        coins: m.reward,
        ...(m.done ? { done: m.status } : {}),
      })),
    },
    weekly: {
      mission: w ? { title: w.title, done: w.progress, total: w.target, coins: w.reward } : null,
      caps: missions.caps.map((c) => ({ id: c.label, label: c.label, used: c.earned, cap: c.cap, period: c.period })),
    },
    earnWays: rules.map((r, i) => ({ id: `e-${i}`, label: r.title, detail: r.condition, coins: firstNumber(r.reward), cap: r.cap })),
    activity: activity.items.map((a) => ({ id: a.id, label: a.title, reason: a.context, amount: a.amount, day: day(a.at) })),
  };
}
