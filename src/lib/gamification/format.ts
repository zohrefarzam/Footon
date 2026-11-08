/**
 * Number formatting for gamification surfaces: thousands separators, no
 * decimals for counts and coins (`1,250`), a real minus sign for losses.
 */
const int = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const dec = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

/** `1,250` */
export const formatNumber = (n: number) => int.format(n);
/** `+20` / `−5` (zero unsigned) */
export const formatSigned = (n: number) => (n === 0 ? "0" : `${n < 0 ? "−" : "+"}${int.format(Math.abs(n))}`);
/** `12.5%` from a 0–100 value */
export const formatPercent = (value0to100: number) => pct.format(value0to100 / 100);
/** `×2` / `×0.5` */
export const formatTimes = (n: number) => `×${dec.format(n)}`;

/** Coarse time left, for quest resets: `45m`, `6h`, `3d`. Never negative. */
export function formatTimeLeft(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60_000));
  if (m < 60) return `${Math.max(1, m)}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
