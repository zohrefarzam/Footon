import Link from "next/link";
import { UserRound } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { RankStrip } from "@/components/footon/division-card";
import { FormBars, type Outcome } from "@/components/footon/form-bars";
import { MyClubLink } from "@/components/footon/gamification/club-page";
import { LevelCard } from "@/components/footon/gamification/level-card";
import { PinnedBadges } from "@/components/footon/gamification/pinned-badges";
import { StreakCounter } from "@/components/footon/gamification/streak";
import { PitchMarkings } from "@/components/footon/pitch-markings";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ordinal } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

export type ProfileCard = { name: string; points: number; pointsLabel: string; rank?: number; size: number; week: number; promote: number; relegate: number };
export type ProfileForm = { results: Outcome[]; wins: number; losses: number; voids: number };

/** Profile: the silver division card, then Stats • Badges • Clubs. The data comes in as props (mock or server); `clubs` is the Clubs tab. */
export function ProfileView({ card, form, clubs }: { card: ProfileCard; form: ProfileForm; clubs: React.ReactNode }) {
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
              <p className="text-[11px] font-bold tracking-[0.12em]">دستهٔ {card.name}</p>
              <p className="mt-2 font-display text-[64px] leading-[0.95] font-bold">{formatNumber(card.points)}</p>
              <p className="text-[13px] font-semibold opacity-70">{card.pointsLabel}</p>
            </div>
            <span className="flex size-[60px] items-center justify-center rounded-[18px] bg-background text-silver" aria-hidden="true">
              <UserRound className="size-7" strokeWidth={1.8} />
            </span>
          </div>
          <div className="mt-[18px]">
            <div className="flex justify-between text-xs font-semibold">
              <span>
                {card.rank ? `${ordinal(card.rank)} از ${formatNumber(card.size)}` : `${formatNumber(card.size)} بازیکن`} • هفتهٔ {formatNumber(card.week)}
              </span>
              <Link href="/leaderboard" className="-my-3 py-3 underline underline-offset-3">
                دیدن جدول
              </Link>
            </div>
            {card.rank ? <RankStrip rank={card.rank} size={card.size} promote={card.promote} relegate={card.relegate} tone="light" className="mt-2" /> : null}
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
                <span className="font-display text-sm font-bold text-win">{formatNumber(form.wins)}</span> برد •{" "}
                <span className="font-display text-sm font-bold text-loss">{formatNumber(form.losses)}</span> باخت •{" "}
                <span className="font-display text-sm font-bold">{formatNumber(form.voids)}</span> باطل
              </p>
            </div>
            <FormBars results={form.results} fill className="h-12" />
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="flex flex-col gap-4">
          <PinnedBadges />
          <MyClubLink />
        </TabsContent>

        <TabsContent value="clubs">
          {clubs}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
