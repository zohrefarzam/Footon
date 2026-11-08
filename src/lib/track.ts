/**
 * Product analytics, stubbed: events go to `window.dataLayer` if present.
 * Wire this to the real analytics client.
 *
 * Client events are UI-only: what the user SAW or TAPPED. Anything the server
 * decides (xp_earned, level_up, badge_earned, streak_*, quest_*,
 * item_purchased…) is tracked server-side and must never be sent from here.
 */
export type TrackEvents = {
  // gamification surfaces
  shop_viewed: { surface?: string };
  card_shared: { surface: "level_up" | "my_club"; method: "telegram" | "web_share" | "download" | "link" };
  level_up_viewed: { level: number };
  badge_toast_viewed: { badge: string };
  badge_wall_viewed: Record<string, never>;
  quest_list_viewed: { count: number };
  quest_completed_viewed: { quest: string };
  streak_broken_viewed: { best: number };
};
export type TrackEvent = keyof TrackEvents;

export function track<E extends TrackEvent>(event: E, ...[props]: TrackEvents[E] extends Record<string, never> ? [] : [TrackEvents[E]]) {
  if (typeof window === "undefined") return;
  const w = window as Window & { dataLayer?: unknown[] };
  w.dataLayer?.push({ event, ...(props ?? {}) });
}
