"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { useSplashDone } from "@/components/footon/splash-gate";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCelebrations } from "@/lib/gamification/celebrations/store";
import { formatNumber } from "@/lib/gamification/format";
import { useProgress } from "@/lib/gamification/queries";
import { copy } from "@/lib/gamification/strings";
import { track } from "@/lib/track";

const SEEN = "luckyfan_streak_broken_seen";

function readSeen(): string | null {
  try {
    return localStorage.getItem(SEEN);
  } catch {
    return null;
  }
}
function markSeen(key: string) {
  try {
    localStorage.setItem(SEEN, key);
  } catch {
    // storage blocked: it may show again next visit, which is harmless
  }
}

/**
 * The run ended. Said kindly: no blame, no red, no warning icon. The best run
 * stays on show and one lime action starts a new one.
 */
export function StreakBrokenSheet({ best, open, onClose }: { best: number; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent closeLabel={copy.close}>
        <DialogHeader className="items-center pt-2 pe-0 text-center">
          <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-2xl bg-surface-3 text-muted-foreground">
            <CalendarDays className="size-6" strokeWidth={2} />
          </span>
          <DialogTitle className="mt-3">{copy.brokenTitle}</DialogTitle>
          <DialogDescription>{copy.brokenBody(best)}</DialogDescription>
        </DialogHeader>
        <p className="flex flex-col items-center">
          <span className="font-display text-[56px] leading-none font-bold">{formatNumber(best)}</span>
          <span className="text-xs text-muted-foreground">{copy.bestRunLabel}</span>
        </p>
        <Button asChild size="lg" onClick={onClose}>
          <Link href="/live">{copy.brokenCta}</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Shows the sheet once per broken run (keyed by the run's last day), after
 * the splash and when no celebration is playing.
 */
export function StreakBrokenWatcher() {
  const streak = useProgress().data?.streak;
  const splashDone = useSplashDone();
  const busy = useCelebrations((s) => s.current !== null);
  const [seenBefore] = useState(readSeen);
  const [closed, setClosed] = useState<string | null>(null);
  const key = streak?.status === "broken" ? `${streak.lastDayKey}:${streak.best}` : null;
  const open = key !== null && key !== seenBefore && key !== closed && splashDone && !busy;

  useEffect(() => {
    if (!open || !key) return;
    markSeen(key);
    track("streak_broken_viewed", { best: streak!.best });
  }, [open, key, streak]);

  if (!streak) return null;
  return <StreakBrokenSheet best={streak.best} open={open} onClose={() => setClosed(key)} />;
}
