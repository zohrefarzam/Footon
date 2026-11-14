import { formatMinute } from "./format";
import { mockToday } from "./mock-data";

const DAY = 86_400_000;

/** The calendar date `offset` days from the mock today (UTC, so server and client agree). */
export function dateFor(offset = 0) {
  return new Date(Date.parse(`${mockToday}T00:00:00Z`) + offset * DAY);
}

/** "دیروز" • "امروز" • "فردا" • "پنجشنبه ۱۵ آبان" (the Persian calendar, as Iran reads dates) */
export function dayLabel(offset = 0) {
  if (offset === -1) return "دیروز";
  if (offset === 0) return "امروز";
  if (offset === 1) return "فردا";
  return dateFor(offset).toLocaleDateString("fa-IR", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

/** "سه‌شنبه ۱۳ آبان" */
export function longDate(offset = 0) {
  return dateFor(offset).toLocaleDateString("fa-IR", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

/**
 * Mock kickoff instant (ISO, UTC) for a fixture: its day from `dayOffset` and
 * its `kickoff` time, 20:00 when the mock has none (live and finished rows).
 * The real API sends a proper instant; this only feeds the mock server.
 */
export function kickoffISO(m: { kickoff?: string; dayOffset?: number }) {
  const day = dateFor(m.dayOffset ?? 0).toISOString().slice(0, 10);
  return `${day}T${m.kickoff ?? "20:00"}:00Z`;
}

/** A fixture's time in one short line: `۶۷'` live, `پایان` at full time, else `امروز 21:00` / `شنبه 13:30`. */
export function matchWhen(m: { status: "live" | "upcoming" | "finished"; minute?: number; day?: string; kickoff?: string }) {
  if (m.status === "live") return formatMinute(m.minute ?? 0);
  if (m.status === "finished") return "پایان";
  return `${m.day ?? "امروز"} ${m.kickoff ?? ""}`.trim();
}
