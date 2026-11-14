import { Check } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { STARTER_DAYS, STARTER_TOTAL } from "@/lib/economy";
import type { Mission } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { CoinAmount } from "./coin";
import { formatNumber } from "@/lib/format";

/**
 * The first-week starter missions: 15,000 coins paid one real action at a
 * time. Done rows say why they paid ("You watched to the final whistle") so
 * the coins read as earned, not gifted. Open rows show what's still on offer.
 */
export function StarterMissions({ missions, day }: { missions: Mission[]; day: number }) {
  const done = missions.filter((m) => m.done);
  const earned = done.reduce((s, m) => s + m.coins, 0);
  const daysLeft = Math.max(0, STARTER_DAYS - day);
  // open missions first: they're the ones you can act on
  const ordered = [...missions.filter((m) => !m.done), ...done];

  return (
    <section aria-labelledby="starter-title" className="flex flex-col gap-2.5">
      <h2 id="starter-title" className="flex items-baseline justify-between text-[13px] font-medium text-muted-foreground">
        هفتهٔ اول
        <span>
          روز <span className="font-display text-[15px] font-bold text-foreground">{formatNumber(day)}</span> از {formatNumber(STARTER_DAYS)}
          {daysLeft > 0 && ` • ${formatNumber(daysLeft)} روز مانده`}
        </span>
      </h2>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2.5 px-4 pt-4 pb-3.5">
          <p className="flex items-baseline gap-1.5">
            <span className="font-display text-[28px] leading-none font-bold text-live">{formatNumber(earned)}</span>
            <span className="text-[13px] text-muted-foreground">از {formatNumber(STARTER_TOTAL)} گرفته‌ای</span>
          </p>
          <Progress value={(done.length / missions.length) * 100} aria-label={`${formatNumber(done.length)} از ${formatNumber(missions.length)} مأموریت انجام شد`} />
        </div>
        <ol>
          {ordered.map((m) => (
            <li key={m.id} className="flex items-center gap-3 border-t border-line px-4 py-3">
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  m.done ? "bg-primary text-primary-foreground" : "border-[1.5px] border-dashed border-line-strong",
                )}
              >
                {m.done && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-[15px] font-semibold", m.done && "text-muted-foreground")}>{m.title}</p>
                {m.done && <p className="mt-0.5 truncate text-xs text-muted-foreground">{m.done}</p>}
              </div>
              <span className="sr-only">{m.done ? "انجام شد." : "باز."}</span>
              <CoinAmount value={m.coins} signed className={cn("text-base", m.done && "text-muted-foreground")} />
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}
