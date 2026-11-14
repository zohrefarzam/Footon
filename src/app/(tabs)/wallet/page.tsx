import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { Coin, CoinAmount } from "@/components/footon/coin";
import { CoinBalance } from "@/components/footon/gamification/coin-balance";
import { StarterMissions } from "@/components/footon/missions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { STARTER_DAYS } from "@/lib/economy";
import { coinActivity, earnWays, profile, starter, wallet, weekly } from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";

const fmt = formatNumber;

/**
 * Wallet: what you have, how to earn more, and where it went. Points, coins
 * and prizes are shown side by side once so nobody mixes them up; the shop is
 * one quiet button in the header, never pushed after a loss or a low balance.
 */
export default function WalletPage() {
  const inFirstWeek = starter.day <= STARTER_DAYS;

  return (
    <AppShell>
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">کیف پول</h1>
        <Button asChild variant="secondary" size="sm" className="h-10 rounded-sm px-3.5">
          <Link href="/shop">
            <ShoppingBag aria-hidden="true" />
            فروشگاه
          </Link>
        </Button>
      </header>

      {/* balance + the three things that never mix */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3.5">
          <Coin className="size-10 text-xl" />
          <div>
            <p className="font-display text-[56px] leading-[0.9] font-bold text-live">
              <CoinBalance fallback={wallet.coins} />
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">سکه برای بازی</p>
          </div>
        </div>
        <dl className="grid grid-cols-3 border-t border-line">
          {[
            { term: "امتیاز", value: fmt(profile.points), desc: "فقط از پیش‌بینی درست. رتبه‌ات را می‌سازه." },
            { term: "سکه", value: <CoinBalance fallback={wallet.coins} />, desc: "برای ورودی، لیگ‌ها و چیزهای اضافه." },
            { term: "جایزه", value: "هفتگی", desc: "از حامی‌ها، به رتبه‌های بالا می‌رسه." },
          ].map((x) => (
            <div key={x.term} className="flex flex-col gap-1 px-3 py-3 [&+&]:border-s [&+&]:border-line">
              <dt className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{x.term}</dt>
              <dd className="font-display text-[22px] leading-none font-bold">{x.value}</dd>
              <dd className="text-xs text-muted-foreground">{x.desc}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {inFirstWeek && <StarterMissions missions={starter.missions} day={starter.day} />}

      <section aria-labelledby="week-title" className="flex flex-col gap-2.5">
        <h2 id="week-title" className="text-[13px] font-medium text-muted-foreground">
          این هفته
        </h2>
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-2 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <p className="min-w-0 flex-1 text-[15px] font-semibold">{weekly.mission.title}</p>
              <CoinAmount value={weekly.mission.coins} signed className="text-base" />
            </div>
            <Progress
              value={(weekly.mission.done / weekly.mission.total) * 100}
              aria-label={`${fmt(weekly.mission.done)} از ${fmt(weekly.mission.total)} انجام شد`}
            />
            <p className="text-xs text-muted-foreground">
              <span className="font-display text-sm font-bold text-foreground">{fmt(weekly.mission.done)}</span> از {fmt(weekly.mission.total)} انجام شد
            </p>
          </div>
          {weekly.caps.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 border-t border-line px-4 py-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[15px] font-semibold">{c.label}</p>
                <p className="shrink-0 text-xs text-muted-foreground">
                  <span className="font-display text-sm font-bold text-foreground">{fmt(c.used)}</span> از {fmt(c.cap)} {c.period}
                </p>
              </div>
              {/* amber: it's a coin allowance, not a score */}
              <Progress value={(c.used / c.cap) * 100} indicatorClassName="bg-live" aria-label={`${c.label}: ${fmt(c.used)} از ${fmt(c.cap)} ${c.period}`} />
            </div>
          ))}
        </Card>
      </section>

      <section aria-labelledby="earn-title" className="flex flex-col gap-2.5">
        <h2 id="earn-title" className="text-[13px] font-medium text-muted-foreground">
          راه‌های گرفتن سکه
        </h2>
        <Card className="overflow-hidden">
          {earnWays.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3 [&+&]:border-t [&+&]:border-line">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{e.label}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {e.detail} • {e.cap}
                </p>
              </div>
              <CoinAmount value={e.coins} signed className="text-base" />
            </div>
          ))}
        </Card>
      </section>

      <section aria-labelledby="activity-title" className="flex flex-col gap-2.5">
        <h2 id="activity-title" className="text-[13px] font-medium text-muted-foreground">
          فعالیت
        </h2>
        <Card className="overflow-hidden">
          {coinActivity.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3 [&+&]:border-t [&+&]:border-line">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{a.label}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {a.day} • {a.reason}
                </p>
              </div>
              <CoinAmount value={a.amount} signed className="text-base" />
            </div>
          ))}
        </Card>
      </section>

      <p className="text-center text-xs text-muted-foreground text-balance">
        سکه نقد نمیشه و نمیشه برای دوستات بفرستی‌اش. با خرید سکه هم هیچ‌وقت امتیاز، رتبه یا جایزه نمی‌خری.
      </p>
    </AppShell>
  );
}
