import Link from "next/link";
import { UserRound } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { RankStrip } from "@/components/footon/division-card";
import { FavouriteClubs } from "@/components/footon/favourite-clubs";
import { FormBars } from "@/components/footon/form-bars";
import { MyClubLink } from "@/components/footon/gamification/club-page";
import { LevelCard } from "@/components/footon/gamification/level-card";
import { PinnedBadges } from "@/components/footon/gamification/pinned-badges";
import { StreakCounter } from "@/components/footon/gamification/streak";
import { PitchMarkings } from "@/components/footon/pitch-markings";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clubDirectory, division, profile, recentForm } from "@/lib/mock-data";
import { ordinal } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

export default function MePage() {
  const wins = recentForm.filter((r) => r === "W").length;
  const losses = recentForm.filter((r) => r === "L").length;
  const voids = recentForm.length - wins - losses;
  const RANK = division.rows.find((r) => r.you)?.rank ?? division.size;
  const OF = division.size;

  return (
    <AppShell className="gap-4 pt-3.5">
      {/* no title bar: the dock names the tab. ponytail: the division card + tabs instead of eight stacked cards */}
      <h1 className="sr-only">پروفایل</h1>

      {/* Silver division card — a silver trading card, tilts slightly on hover */}
      <div className="group perspective-[900px]">
        <section className="relative isolate overflow-hidden rounded-3xl bg-silver p-5 text-background shadow-[0_24px_50px_-24px_rgb(201_212_206/0.35)] transition-transform duration-500 ease-spring-soft group-hover:-translate-y-0.5 group-hover:rotate-x-6 group-hover:-rotate-y-8 [--pitch-line:rgb(6_20_15/0.12)]">
          <PitchMarkings variant="box" className="-z-10" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em]">دستهٔ {division.name}</p>
              <p className="mt-2 font-display text-[64px] leading-[0.95] font-bold">{formatNumber(profile.points)}</p>
              <p className="text-[13px] font-semibold opacity-70">کل امتیاز</p>
            </div>
            <span className="flex size-[60px] items-center justify-center rounded-[18px] bg-background text-silver" aria-hidden="true">
              <UserRound className="size-7" strokeWidth={1.8} />
            </span>
          </div>
          <div className="mt-[18px]">
            <div className="flex justify-between text-xs font-semibold">
              <span>
                {ordinal(RANK)} از {formatNumber(OF)} • هفتهٔ {formatNumber(division.week)}
              </span>
              <Link href="/leaderboard" className="-my-3 py-3 underline underline-offset-3">
                دیدن جدول
              </Link>
            </div>
            <RankStrip rank={RANK} size={OF} promote={division.promote} relegate={division.relegate} tone="light" className="mt-2" />
          </div>
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
