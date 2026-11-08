/**
 * Streak days are match days keyed by the match's START date in the user's
 * own timezone: a 23:30 kickoff that ends after midnight still belongs to the
 * day it started. The server does the counting; the client uses this to send
 * the user's timezone and to label days consistently.
 */
export function matchDayKey(kickoff: string | Date, timeZone: string): string {
  const d = typeof kickoff === "string" ? new Date(kickoff) : kickoff;
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** The browser's IANA timezone, falling back to UTC (SSR, odd runtimes). */
export function userTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Calendar days between two day keys (b − a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}
