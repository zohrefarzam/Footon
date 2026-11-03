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
