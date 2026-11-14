/**
 * Every number the UI shows goes through here, in Persian: Persian digits and
 * the Persian thousands separator (`۱۰٬۰۰۰`), no decimals for counts and coins,
 * a real minus sign for losses. The FaNum font draws any stray Latin digit as
 * Persian too, but formatted numbers also read right to screen readers and on copy.
 */
const int = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const pct = new Intl.NumberFormat("fa-IR", { style: "percent", maximumFractionDigits: 1 });
const dec = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });

/**
 * Keeps a short mixed run (a sign, a prime, a Latin `x`) reading left to right
 * inside Persian text, so `+۲۰` never turns into `۲۰+` and `۶۷'` stays put.
 * (U+2066 LEFT-TO-RIGHT ISOLATE … U+2069 POP DIRECTIONAL ISOLATE.)
 */
export const ltr = (s: string) => `\u2066${s}\u2069`;

/** `۱٬۲۵۰` */
export const formatNumber = (n: number) => int.format(n);
/** `+۲۰` / `−۵` (zero unsigned) */
export const formatSigned = (n: number) => (n === 0 ? int.format(0) : ltr(`${n < 0 ? "−" : "+"}${int.format(Math.abs(n))}`));
/** `۱۲٫۵٪` from a 0–100 value */
export const formatPercent = (value0to100: number) => pct.format(value0to100 / 100);
/** `×۲` / `×۰٫۵` */
export const formatTimes = (n: number) => ltr(`×${dec.format(n)}`);
/** A match minute: `۶۷'` */
export const formatMinute = (n: number) => ltr(`${int.format(n)}'`);
/** A boost: `۲x` */
export const formatBoost = (n: number) => ltr(`${int.format(n)}x`);
/**
 * Two sides of a fixture, home first in reading order (so on the right):
 * `لیورپول - سیتی`, and `LIV - MCI` stays home-on-the-right too (a right-to-left
 * mark around the dash keeps two Latin codes from flipping into one LTR run).
 */
export const matchup = (home: string, away: string) => `${home} \u200f-\u200f ${away}`;
/** A score, home first: `۲–۱` */
export const formatScore = (home: number, away: number) => `${int.format(home)}–${int.format(away)}`;

/** Latin digits in a string → Persian (`"20:00"` → `"۲۰:۰۰"`). For scores, times and minutes built as strings. */
export const faDigits = (s: string | number) => String(s).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

/** Persian ordinal: `اول`, `دوم`, `سوم`, then `۴ام`, `۲۳ام`. */
export const ordinal = (n: number) => (n === 1 ? "اول" : n === 2 ? "دوم" : n === 3 ? "سوم" : `${formatNumber(n)}ام`);

/** Coarse time left, for quest resets: `۴۵ دقیقه`, `۶ ساعت`, `۳ روز`. Never negative. */
export function formatTimeLeft(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60_000));
  if (m < 60) return `${formatNumber(Math.max(1, m))} دقیقه`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${formatNumber(h)} ساعت`;
  return `${formatNumber(Math.floor(h / 24))} روز`;
}

/** Persian (۰–۹) and Arabic-Indic (٠–٩) digits typed on a Persian keyboard → Latin, for parsing inputs. */
export const toLatinDigits = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0)).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660));
