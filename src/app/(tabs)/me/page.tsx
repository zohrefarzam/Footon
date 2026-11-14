import Link from "next/link";
import { Settings, UserRound } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { RankStrip } from "@/components/footon/division-card";
import { FavouriteClubs } from "@/components/footon/favourite-clubs";
import { FormBars } from "@/components/footon/form-bars";
import { MyClubLink } from "@/components/footon/gamification/club-page";
import { LevelCard } from "@/components/footon/gamification/level-card";
import { PinnedBadges } from "@/components/footon/gamification/pinned-badges";
import { StreakCounter } from "@/components/footon/gamification/streak";
import { PitchMarkings } from "@/components/footon/pitch-markings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clubDirectory, division, profile, recentForm } from "@/lib/mock-data";
import { cn, ordinal } from "@/lib/utils";
import { formatBoost, formatNumber } from "@/lib/format";


export default function MePage() {
  const wins = recentForm.filter((r) => r === "W").length;
  const losses = recentForm.filter((r) => r === "L").length;
  const voids = recentForm.length - wins - losses;
  const rate = Math.round((wins / Math.max(1, wins + losses)) * 100);
  const RANK = division.rows.find((r) => r.you)?.rank ?? division.size;
  const OF = division.size;

  return (
    <AppShell className="gap-5 pt-3.5">
      <header className="flex h-10 items-center justify-between">
        <h1 className="text-[22px] font-bold tracking-[-0.03em]">پروفایل</h1>
        <Button variant="secondary" size="icon" aria-label="تنظیمات" className="size-10">
          <Settings />
        </Button>
      </header>

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

      <section id="level" aria-labelledby="level-title" className="flex scroll-mt-24 flex-col gap-2.5">
        <h2 id="level-title" className="text-[13px] font-medium text-muted-foreground">
          سطح
        </h2>
        <LevelCard />
      </section>

      <section aria-labelledby="streak-title" className="flex flex-col gap-2.5">
        <h2 id="streak-title" className="text-[13px] font-medium text-muted-foreground">
          زنجیره
        </h2>
        <StreakCounter />
      </section>

      <FavouriteClubs clubs={clubDirectory} initial={profile.favoriteTeams} />

      <section className="flex flex-col gap-2.5">
        <h2 className="text-[13px] font-medium text-muted-foreground">وضعیت اخیر</h2>
        <Card className="gap-4 p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-[56px] leading-[0.9] font-bold">
                {formatNumber(rate)}
                <span className="text-[28px] text-muted-foreground">٪</span>
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">پیش‌بینی درست، {formatNumber(recentForm.length)} تای آخر</p>
            </div>
            <dl className="flex gap-4 text-center">
              {[
                { label: "برد", value: wins, tone: "text-win" },
                { label: "باخت", value: losses, tone: "text-loss" },
                { label: "باطل", value: voids, tone: "text-muted-foreground" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-xs text-muted-foreground">{s.label}</dt>
                  <dd className={cn("font-display text-[28px] leading-none font-bold", s.tone)}>{formatNumber(s.value)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <FormBars results={recentForm} fill className="h-14" />
            <div className="mt-2 flex justify-between text-[11px] font-medium text-muted-foreground" aria-hidden="true">
              <span>قدیمی‌تر</span>
              <span>تازه‌تر</span>
            </div>
          </div>
        </Card>
      </section>

      <Card className="flex-row items-center gap-3.5 px-4 py-3.5">
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="flex h-11 w-[34px] items-center justify-center rounded-sm bg-live font-display text-[17px] font-bold text-live-foreground shadow-[inset_0_-3px_0_rgb(0_0_0/0.2)]"
            >
              {formatBoost(2)}
            </span>
          ))}
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold">{formatNumber(2)} بوست مانده</p>
          <p className="mt-0.5 text-xs text-muted-foreground">امتیازت دو برابر • یک بار در هر بازی • به‌دست‌آوردنی، نه فروشی</p>
        </div>
      </Card>

      <PinnedBadges />

      <section aria-labelledby="club-title" className="flex flex-col gap-2.5">
        <h2 id="club-title" className="text-[13px] font-medium text-muted-foreground">
          باشگاه من
        </h2>
        <MyClubLink />
      </section>
    </AppShell>
  );
}
