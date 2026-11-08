import { mockToday } from "./mock-data";

const DAY = 86_400_000;

/** The calendar date `offset` days from the mock today (UTC, so server and client agree). */
export function dateFor(offset = 0) {
  return new Date(Date.parse(`${mockToday}T00:00:00Z`) + offset * DAY);
}

/** "Yesterday" · "Today" · "Tomorrow" · "Thu 5 Nov" */
export function dayLabel(offset = 0) {
  if (offset === -1) return "Yesterday";
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  return dateFor(offset).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

/** "Tuesday 3 November" */
export function longDate(offset = 0) {
  return dateFor(offset).toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
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
