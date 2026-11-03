/**
 * Product analytics, stubbed. The Phase 2 shop exists to measure purchase
 * intent before any payment is built: who opens the shop, taps an item, asks
 * to be notified, and which item gets the taps. Wire this to the real
 * analytics client; until then events go to `window.dataLayer` if present.
 */
export type TrackEvent = "shop_open" | "shop_item_tap" | "shop_notify";

export function track(event: TrackEvent, props: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  const w = window as Window & { dataLayer?: unknown[] };
  w.dataLayer?.push({ event, ...props });
}
