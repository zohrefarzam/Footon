import { ArrowLeftRight } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { LockedFeatureGate } from "@/components/footon/gamification/locked-feature-gate";
import { Button } from "@/components/ui/button";
import { Card, CardRow } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Pitch } from "./pitch";

export default function FantasyPage() {
  return (
    <AppShell className="gap-4 pt-3.5">
      <h1 className="sr-only">Fantasy</h1>
      <LockedFeatureGate feature="fantasy" title="Fantasy">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[13px] text-muted-foreground">Matchday 12 · live</p>
          <p className="mt-0.5 flex items-baseline gap-2">
            <span className="font-display text-[56px] leading-none font-bold">62</span>
            <span className="text-sm text-muted-foreground">pts</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">League rank</p>
          <p className="mt-0.5 font-display text-[28px] font-bold">
            2nd<span className="text-base text-muted-foreground"> / 4</span>
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
          <span className="flex size-[34px] items-center justify-center rounded-sm bg-live-soft font-display text-base font-bold text-live">2x</span>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">Captain · 2x points</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Forward · plays tonight</p>
          </div>
          <span className="font-display text-xl font-bold text-win">+14</span>
        </CardRow>
        <CardRow>
          <span className="flex size-[34px] items-center justify-center rounded-sm bg-surface-2 text-silver">
            <ArrowLeftRight className="size-4" />
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-semibold">Transfers</p>
            <p className="mt-0.5 text-xs text-muted-foreground">1 left this week</p>
          </div>
          <Button variant="secondary" size="sm" className="h-[34px] rounded-sm border-0 bg-track">
            Change
          </Button>
        </CardRow>
      </Card>

      {/* ponytail: no save handler — wire to the lineup API when it exists */}
      <Button size="lg">Save lineup</Button>
      </LockedFeatureGate>
    </AppShell>
  );
}
