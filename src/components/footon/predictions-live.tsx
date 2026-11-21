"use client";

import { PageLoader } from "./page-loader";
import { useSyncExternalStore } from "react";

import { AppShell } from "@/components/footon/app-shell";
import { PredictionsBoard, type CouponEntry } from "@/components/footon/predictions-board";
import { dateKey } from "@/lib/football/fixtures";
import { toServiceMatch } from "@/lib/slips/match";
import { picksOf, useMyPredictions } from "@/lib/slips/api";

const noop = () => () => {};

/** The coupon on the backend's predictions: open picks first, settled ones with their outcome. */
export function PredictionsLive() {
  const today = useSyncExternalStore(noop, () => dateKey(new Date()), () => null);
  const { data, isError } = useMyPredictions();

  if (isError)
    return (
      <AppShell>
        <p className="text-center text-sm text-muted-foreground">الان نمی‌تونیم پیش‌بینی‌هات را بیاریم. چند لحظهٔ دیگه دوباره بیا.</p>
      </AppShell>
    );
  if (!data || !today)
    return (
      <AppShell>
        <PageLoader />
      </AppShell>
    );

  const entries: CouponEntry[] = data.items
    .map((i) => ({ match: toServiceMatch(i.match, today), slip: picksOf(i), settled: i.status !== "Open" }))
    .filter((e) => e.slip.length > 0);
  return <PredictionsBoard entries={entries} summary={{ picks: data.summary.openPicks, staked: data.summary.staked, couldWin: data.summary.couldWin }} />;
}
