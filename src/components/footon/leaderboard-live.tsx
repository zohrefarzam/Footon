"use client";

import { AppShell } from "@/components/footon/app-shell";
import { LeaderboardBoard } from "@/components/footon/leaderboard-board";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaderboard } from "@/lib/leaderboard/api";

/** The leaderboard on the backend: your division table and your friends' leagues. */
export function LeaderboardLive() {
  const { data, isError } = useLeaderboard();
  if (isError)
    return (
      <AppShell>
        <p className="text-center text-sm text-muted-foreground">الان نمی‌تونیم جدول را بیاریم. چند لحظهٔ دیگه دوباره بیا.</p>
      </AppShell>
    );
  if (!data)
    return (
      <AppShell>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </AppShell>
    );
  return <LeaderboardBoard division={data.division} need={data.need} leagues={data.leagues} />;
}
