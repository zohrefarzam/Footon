"use client";

import { PageLoader } from "./page-loader";
import { useSyncExternalStore } from "react";

import { dateKey } from "@/lib/football/fixtures";
import { useFixtureDays } from "@/lib/football/queries";
import { MatchDays } from "./match-days";

const noop = () => () => {};
const DAYS = [-2, -1, 0, 1, 2, 3, 4, 5];

/** The Live tab on real fixtures: today is the viewer's own date (null on the server, so server and client agree). */
export function LiveDays() {
  const today = useSyncExternalStore(noop, () => dateKey(new Date()), () => null);
  const { matches, loading, error } = useFixtureDays(today, DAYS);

  if (error) return <p className="text-center text-sm text-muted-foreground">الان نمی‌تونیم بازی‌ها را بیاریم. چند لحظهٔ دیگه دوباره بیا.</p>;
  if (loading || !today) return <PageLoader />;
  return <MatchDays matches={matches} today={today} />;
}
