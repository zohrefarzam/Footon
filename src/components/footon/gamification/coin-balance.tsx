"use client";

import { formatNumber } from "@/lib/gamification/format";
import { useProgress } from "@/lib/gamification/queries";

/** The free-coin balance in the server's numbers; `fallback` until progress loads. */
export function CoinBalance({ fallback, className }: { fallback: number; className?: string }) {
  const coins = useProgress().data?.coins.free ?? fallback;
  return <span className={className}>{formatNumber(coins)}</span>;
}
