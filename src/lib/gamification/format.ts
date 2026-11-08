/**
 * Persian number formatting for gamification surfaces. Counts, XP, coins and
 * percentages render in Persian digits (`۱٬۲۵۰`). Wrap mixed-direction pieces
 * (`+۲۰ XP`) in `<bdi>` where they sit inside Persian sentences.
 */
const int = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const signed = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0, signDisplay: "exceptZero" });
const pct = new Intl.NumberFormat("fa-IR", { style: "percent", maximumFractionDigits: 1 });
const dec = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });

/** `۱٬۲۵۰` */
export const faNum = (n: number) => int.format(n);
/** `+۲۰` / `−۵` (zero unsigned) */
export const faSigned = (n: number) => signed.format(n);
/** `۱۲٫۵٪` from a 0–100 value */
export const faPercent = (value0to100: number) => pct.format(value0to100 / 100);
/** `×۲` / `×۰٫۵` */
export const faTimes = (n: number) => `×${dec.format(n)}`;
