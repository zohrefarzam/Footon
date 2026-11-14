import { ArrowLeftRight } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { LockedFeatureGate } from "@/components/footon/gamification/locked-feature-gate";
import { Button } from "@/components/ui/button";
import { Card, CardRow } from "@/components/ui/card";
import { cn, ordinal } from "@/lib/utils";
import { Pitch } from "./pitch";
import { formatBoost, formatNumber, formatSigned } from "@/lib/format";

export default function FantasyPage() {
  return (
    <AppShell className="gap-4 pt-3.5">
      <h1 className="sr-only">فانتزی</h1>
      <LockedFeatureGate feature="fantasy" title="فانتزی">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground">هفتهٔ {formatNumber(12)} • زنده</p>
          <p className="mt-0.5 flex items-baseline gap-2">
            <span className="font-display text-[56px] leading-none font-bold">{formatNumber(62)}</span>
            <span className="text-sm text-muted-foreground">امتیاز</span>
          </p>
        </div>
        <div className="text-end">
          <p className="text-xs text-muted-foreground">رتبه در لیگ</p>
          <p className="mt-0.5 font-display text-[28px] font-bold">
            {ordinal(2)}<span className="text-base text-muted-foreground"> / {formatNumber(4)}</span>
          </p>
          <div className="mt-1 flex justify-end gap-[3px]" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1 w-4 rounded-full", i === 0 ? "bg-dim" : i === 1 ? "bg-primary" : "bg-track")} />
            ))}
          </div>
        </div>
      </header>

      <Pitch />

      <Card className="overflow-hidden">
        <CardRow>
          <span className="flex size-[34px] items-center justify-center rounded-sm bg-live-soft font-display text-base font-bold text-live">{formatBoost(2)}</span>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">کاپیتان • امتیاز {formatNumber(2)} برابر</p>
            <p className="mt-0.5 text-xs text-muted-foreground">مهاجم • امشب بازی داره</p>
          </div>
          <span className="font-display text-xl font-bold text-win">{formatSigned(14)}</span>
        </CardRow>
        <CardRow>
          <span className="flex size-[34px] items-center justify-center rounded-sm bg-surface-2 text-silver">
            <ArrowLeftRight className="size-4" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">نقل‌وانتقال</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatNumber(1)} تا برای این هفته مونده</p>
          </div>
          <Button variant="secondary" size="sm" className="h-[34px] rounded-sm border-0 bg-track">
            تغییر
          </Button>
        </CardRow>
      </Card>

      {/* ponytail: no save handler — wire to the lineup API when it exists */}
      <Button size="lg">ذخیرهٔ ترکیب</Button>
      </LockedFeatureGate>
    </AppShell>
  );
}
