"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Time to kick-off, ticking each second (FotMob's 01:53:39 under the kickoff).
 * Rendered after mount so server and client never disagree; screen readers get
 * one static label instead of a value that changes every second.
 */
export function Countdown({ kickoff, dayOffset = 0, className }: { kickoff: string; dayOffset?: number; className?: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const [h, m] = kickoff.split(":").map(Number);
    const target = new Date();
    target.setDate(target.getDate() + dayOffset);
    target.setHours(h, m, 0, 0);
    const tick = () => setLeft(Math.max(0, Math.round((target.getTime() - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [kickoff, dayOffset]);

  if (left === null) return <span className={className}>&nbsp;</span>;
  if (left === 0) return <span className={className}>به‌زودی شروع می‌شود</span>;

  return (
    <span className={className} role="timer" aria-label={`حدود ${formatNumber(Math.ceil(left / 60))} دقیقه تا شروع`}>
      <span aria-hidden="true" dir="ltr" className="tabular-nums">
        {pad(Math.floor(left / 3600))}:{pad(Math.floor((left % 3600) / 60))}:{pad(left % 60)}
      </span>
    </span>
  );
}
