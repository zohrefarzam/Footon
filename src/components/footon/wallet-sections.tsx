"use client";

import { CoinAmount } from "@/components/footon/coin";
import { StarterMissions } from "@/components/footon/missions";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { STARTER_DAYS } from "@/lib/economy";
import { formatNumber } from "@/lib/format";
import { useWalletData } from "@/lib/wallet/queries";
import type { WalletData } from "@/lib/wallet/schemas";

const fmt = formatNumber;

/** Wallet's missions, week, ways to earn and activity, drawn from props (mock or server). */
export function WalletSections({ starter, weekly, earnWays, activity }: WalletData) {
  return (
    <>
      {starter.day <= STARTER_DAYS && starter.missions.length > 0 && <StarterMissions missions={starter.missions} day={starter.day} />}

      {(weekly.mission || weekly.caps.length > 0) && (
        <section aria-labelledby="week-title" className="flex flex-col gap-2.5">
          <h2 id="week-title" className="text-[13px] font-medium text-muted-foreground">
            این هفته
          </h2>
          <Card className="overflow-hidden">
            {weekly.mission && (
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
            )}
            {weekly.caps.map((c) => (
              <div key={c.id} className="flex flex-col gap-2 border-t border-line px-4 py-3.5 first:border-t-0">
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
      )}

      {earnWays.length > 0 && (
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
      )}

      {activity.length > 0 && (
        <section aria-labelledby="activity-title" className="flex flex-col gap-2.5">
          <h2 id="activity-title" className="text-[13px] font-medium text-muted-foreground">
            فعالیت
          </h2>
          <Card className="overflow-hidden">
            {activity.map((a) => (
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
      )}
    </>
  );
}

/** The same sections from the backend; skeleton while loading, a quiet line if it can't load. */
export function WalletLive() {
  const { data, isError } = useWalletData();
  if (data) return <WalletSections {...data} />;
  if (isError) return <p className="text-center text-sm text-muted-foreground">الان نمی‌تونیم فعالیت کیف پولت را نشون بدیم. چند لحظهٔ دیگه دوباره بیا.</p>;
  return <Skeleton className="h-48 w-full rounded-2xl" />;
}
