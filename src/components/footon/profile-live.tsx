"use client";

import { useState } from "react";

import { PageLoader } from "./page-loader";
import { AppShell } from "@/components/footon/app-shell";
import { FavouriteClubs } from "@/components/footon/favourite-clubs";
import { ProfileView } from "@/components/footon/profile-view";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaderboard } from "@/lib/leaderboard/api";
import { useClubSearch, useClubs, useFormStats, useSaveClubs } from "@/lib/profile/api";

function LiveClubs() {
  const { data, isPending, isError } = useClubs();
  const save = useSaveClubs(data?.idOf ?? {});
  const [query, setQuery] = useState("");
  const search = useClubSearch(query);
  if (isPending) return <PageLoader />;
  if (isError || !data) return <p className="text-center text-sm text-muted-foreground">الان نمی‌تونیم باشگاه‌هات را بیاریم. چند لحظهٔ دیگه دوباره بیا.</p>;
  return <FavouriteClubs clubs={data.teams} initial={data.followed} onChange={save} onSearch={setQuery} searchResults={search.data} searching={search.isFetching} />;
}

/** Profile on the backend: your division card and recent form; level, streak and badges already come from the gamification server. */
export function ProfileLive() {
  const board = useLeaderboard();
  const form = useFormStats();

  if (!board.data || !form.data)
    return (
      <AppShell className="gap-4 pt-3.5">
        <h1 className="sr-only">پروفایل</h1>
        {board.isError || form.isError ? (
          <p className="text-center text-sm text-muted-foreground">الان نمی‌تونیم پروفایل را بیاریم. چند لحظهٔ دیگه دوباره بیا.</p>
        ) : (
          <Skeleton className="h-64 w-full rounded-3xl" />
        )}
      </AppShell>
    );

  const d = board.data.division;
  const you = d.rows.find((r) => r.you);
  return (
    <ProfileView
      card={{ name: d.name, points: you?.points ?? 0, pointsLabel: "امتیاز این هفته", rank: you?.rank, size: d.size, week: d.week, promote: d.promote, relegate: d.relegate }}
      form={form.data}
      clubs={<LiveClubs />}
    />
  );
}
