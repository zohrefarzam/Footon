import Link from "next/link";
import { Eye, Flame, Lock, Settings, Trophy, UserRound } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { FormBars } from "@/components/footon/form-bars";
import { Button } from "@/components/ui/button";
import { Card, CardRow } from "@/components/ui/card";
import { recentForm } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const RANK = 8;
const OF = 30;

const achievements = [
  { label: "Prophet", icon: Eye, tone: "bg-primary-soft text-primary" },
  { label: "Streak 5", icon: Flame, tone: "bg-live-soft text-live" },
  { label: "First win", icon: Trophy, tone: "bg-[#1c1c21] text-[#e4e4e7]" },
];

const collection = [
  { label: "Players", count: 3 },
  { label: "Boots", count: 2 },
  { label: "Stadiums", count: 1 },
  { label: "Kits", locked: "Unlocks at level 5" },
];

export default function MePage() {
  const wins = recentForm.filter((r) => r === "W").length;
  const losses = recentForm.filter((r) => r === "L").length;
  const voids = recentForm.length - wins - losses;
  const rate = Math.round((wins / Math.max(1, wins + losses)) * 100);

  return (
    <AppShell className="gap-5 pt-3.5">
      <header className="flex h-10 items-center justify-between">
        <h1 className="text-[22px] font-bold tracking-[-0.03em]">Profile</h1>
        <Button variant="secondary" size="icon" aria-label="Settings" className="size-10">
          <Settings />
        </Button>
      </header>

      {/* Silver league card — tilts slightly on hover */}
      <div className="group perspective-[900px]">
        <section className="rounded-3xl bg-[#d4d4d8] bg-[radial-gradient(rgb(9_9_11/0.12)_1px,transparent_1px)] bg-[length:12px_12px] p-5 text-background shadow-[0_24px_50px_-24px_rgb(212_212_216/0.35)] transition-transform duration-500 ease-spring-soft group-hover:-translate-y-0.5 group-hover:rotate-x-6 group-hover:-rotate-y-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em]">SILVER LEAGUE</p>
              <p className="mt-2 font-display text-[64px] leading-[0.95] font-bold">4,820</p>
              <p className="text-[13px] font-semibold opacity-70">Total score</p>
            </div>
            <span className="flex size-[60px] items-center justify-center rounded-[18px] bg-background text-[#d4d4d8]" aria-hidden="true">
              <UserRound className="size-7" strokeWidth={1.8} />
            </span>
          </div>
          <div className="mt-[18px]">
            <div className="flex justify-between text-xs font-semibold">
              <span>
                Rank {RANK} of {OF}
              </span>
              <Link href="/" className="underline underline-offset-3">
                View leaderboard
              </Link>
            </div>
            <div role="img" aria-label={`Rank ${RANK} of ${OF}`} className="mt-2 grid h-4 grid-cols-30 items-end gap-0.5">
              {Array.from({ length: OF }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "rounded-[2px]",
                    i + 1 === RANK ? "h-4 bg-background" : "h-2",
                    i + 1 < RANK ? "bg-background/55" : i + 1 > RANK && "bg-background/18",
                  )}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-[13px] font-medium text-muted-foreground">Recent form</h2>
        <Card className="gap-4 p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-[56px] leading-[0.9] font-bold">
                {rate}
                <span className="text-[28px] text-muted-foreground">%</span>
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">Calls right, last {recentForm.length}</p>
            </div>
            <dl className="flex gap-4 text-center">
              {[
                { label: "Won", value: wins, tone: "text-win" },
                { label: "Lost", value: losses, tone: "text-loss" },
                { label: "Void", value: voids, tone: "text-muted-foreground" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-xs text-muted-foreground">{s.label}</dt>
                  <dd className={cn("font-display text-[28px] leading-none font-bold", s.tone)}>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <FormBars results={recentForm} fill className="h-14" />
            <div className="mt-2 flex justify-between text-[11px] font-medium text-muted-foreground" aria-hidden="true">
              <span>Oldest</span>
              <span>Latest</span>
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
              2x
            </span>
          ))}
        </div>
        <div className="flex-1">
          <p className="text-[15px] font-semibold">2 boosts left</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Double your gain · once per match</p>
        </div>
      </Card>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-[13px] font-medium text-muted-foreground">Achievements</h2>
        <ul className="grid grid-cols-3 gap-2">
          {achievements.map(({ label, icon: Icon, tone }) => (
            <li
              key={label}
              className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-3 transition-[transform,border-color] duration-200 ease-spring hover:-translate-y-0.5 hover:border-line-strong"
            >
              <span className={cn("flex size-8 items-center justify-center rounded-sm", tone)}>
                <Icon className="size-[17px]" />
              </span>
              <span className="text-[13px] font-semibold">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2.5">
        <h2 className="text-[13px] font-medium text-muted-foreground">Collection</h2>
        <Card className="overflow-hidden">
          {collection.map((c) => (
            <CardRow key={c.label} className="py-3">
              <span className={cn("flex-1 text-[15px] font-semibold", c.locked && "text-muted-foreground")}>{c.label}</span>
              {c.locked ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" />
                  {c.locked}
                </span>
              ) : (
                <span className="font-display text-xl font-bold">{c.count}</span>
              )}
            </CardRow>
          ))}
        </Card>
      </section>
    </AppShell>
  );
}
