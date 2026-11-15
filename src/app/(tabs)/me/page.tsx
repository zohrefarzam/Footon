import Link from "next/link";
import { ChevronRight, Settings, UserRound } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { RankStrip } from "@/components/footon/division-card";
import { FavouriteClubs } from "@/components/footon/favourite-clubs";
import { FormBars } from "@/components/footon/form-bars";
import { MyClubLink } from "@/components/footon/gamification/club-page";
import { LevelCard } from "@/components/footon/gamification/level-card";
import { PinnedBadges } from "@/components/footon/gamification/pinned-badges";
import { StreakCounter } from "@/components/footon/gamification/streak";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clubDirectory, division, profile, recentForm } from "@/lib/mock-data";
import { ordinal } from "@/lib/utils";
import { formatBoost, formatNumber } from "@/lib/format";

export default function MePage() {
  const wins = recentForm.filter((r) => r === "W").length;
  const losses = recentForm.filter((r) => r === "L").length;
  const voids = recentForm.length - wins - losses;
  const rate = Math.round((wins / Math.max(1, wins + losses)) * 100);
  const RANK = division.rows.find((r) => r.you)?.rank ?? division.size;
  const OF = division.size;

  const stats = [
    { label: "درست", value: <>{formatNumber(rate)}<span className="text-[15px] opacity-60">٪</span></> },
    { label: "برد", value: formatNumber(wins) },
    { label: `بوست ${formatBoost(2)}`, value: formatNumber(2) },
  ];

  return (
    <AppShell className="gap-4 pt-3.5">
      {/* no title bar: the dock names the tab. ponytail: one hero + tabs instead of eight stacked cards */}
      <h1 className="sr-only">پروفایل</h1>

      {/* the silver division card: everything you check most, one glance, no scroll */}
      <div className="group perspective-[900px]">
        <section className="relative isolate overflow-hidden rounded-3xl bg-silver p-5 text-background shadow-[0_24px_50px_-24px_rgb(201_212_206/0.35)] transition-transform duration-500 ease-spring-soft group-hover:-translate-y-0.5 group-hover:rotate-x-6 group-hover:-rotate-y-8 [--pitch-line:rgb(6_20_15/0.12)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-[14px] bg-background text-silver" aria-hidden="true">
                <UserRound className="size-6" strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-[15px] font-bold">{profile.name}</p>
                <p className="text-xs font-semibold opacity-70">دستهٔ {division.name} • هفتهٔ {formatNumber(division.week)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" aria-label="تنظیمات" className="-me-2 -mt-1.5 size-10 text-background hover:bg-background/10">
              <Settings />
            </Button>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="min-w-0 font-display text-[56px] leading-[0.9] font-bold max-[359px]:text-[44px]">
              {formatNumber(profile.points)}
              <span className="ms-1.5 text-[13px] font-semibold opacity-70">امتیاز</span>
            </p>
            <Link
              href="/leaderboard"
              aria-label={`رتبهٔ ${ordinal(RANK)} از ${formatNumber(OF)}، دیدن جدول`}
              className="flex h-11 shrink-0 items-center gap-1 rounded-full bg-background px-3.5 text-silver outline-none transition-transform duration-150 ease-spring focus-visible:ring-[3px] focus-visible:ring-background/40 active:scale-95"
            >
              <span className="font-display text-[17px] font-bold">{ordinal(RANK)}</span>
              <span className="text-xs font-semibold opacity-70 max-[359px]:hidden">از {formatNumber(OF)}</span>
              <ChevronRight className="size-4 opacity-70 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
          <RankStrip rank={RANK} size={OF} promote={division.promote} relegate={division.relegate} tone="light" className="mt-3" />

          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            {stats.map((st) => (
              <div key={st.label} className="flex flex-col-reverse rounded-xl bg-background/[0.07] py-2">
                <dt className="text-[11px] font-semibold opacity-70">{st.label}</dt>
                <dd className="font-display text-[22px] leading-tight font-bold">{st.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <Tabs defaultValue="stats" className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="stats">آمار</TabsTrigger>
          <TabsTrigger value="badges">نشان‌ها</TabsTrigger>
          <TabsTrigger value="clubs">تیم‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="flex flex-col gap-3">
          <div id="level" className="scroll-mt-24">
            <LevelCard />
          </div>
          <StreakCounter />
          <Card className="gap-3 p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[15px] font-semibold">وضعیت اخیر</h2>
              <p className="text-xs text-muted-foreground">
                <span className="font-display text-sm font-bold text-win">{formatNumber(wins)}</span> برد •{" "}
                <span className="font-display text-sm font-bold text-loss">{formatNumber(losses)}</span> باخت •{" "}
                <span className="font-display text-sm font-bold">{formatNumber(voids)}</span> باطل
              </p>
            </div>
            <FormBars results={recentForm} fill className="h-12" />
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="flex flex-col gap-4">
          <PinnedBadges />
          <MyClubLink />
        </TabsContent>

        <TabsContent value="clubs">
          <FavouriteClubs clubs={clubDirectory} initial={profile.favoriteTeams} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
