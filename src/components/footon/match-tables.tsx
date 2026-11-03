import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ENTRY_TIERS, FREE_TABLE_REWARDS, splitPool } from "@/lib/economy";
import { CoinAmount } from "./coin";

export type CoinTable = { league: string; entry: number; players: number; href: string };

const rowLink =
  "flex items-center gap-3 border-t border-line px-4 py-3.5 outline-none transition-colors hover:bg-[#141417] focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60";

/** "Winner takes 5,700" or "5,700 / 2,443" from 5 players up. */
export function poolLine(entry: number, players: number) {
  const { payouts } = splitPool(entry, players);
  const fmt = (n: number) => n.toLocaleString("en-US");
  return payouts.length === 1 ? `winner takes ${fmt(payouts[0])}` : `1st ${fmt(payouts[0])} · 2nd ${fmt(payouts[1])}`;
}

/**
 * Every match has two tables, and you can sit at either:
 * - Free table: always open, no coins in. Top three get coins (capped weekly).
 *   It's the guarantee that running low never forces a purchase.
 * - Coin table: your friends' league pool. Entry in, 5% burned, the rest to
 *   the winner (70/30 from five players).
 * Both rank on the same points; the entry never changes your rank.
 */
export function MatchTables({ joinedFree, coin }: { joinedFree: boolean; coin?: CoinTable }) {
  return (
    <section aria-labelledby="tables-title" className="flex flex-col gap-2.5">
      <h2 id="tables-title" className="text-[13px] font-medium text-muted-foreground">
        Two tables, same calls
      </h2>
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">Free table</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Always open · top 3 get {FREE_TABLE_REWARDS.map((n) => n.toLocaleString("en-US")).join(" / ")}
            </p>
          </div>
          {joinedFree ? <Badge variant="soft">You&apos;re in</Badge> : <Badge variant="outline">Free</Badge>}
        </div>

        {coin ? (
          <Link href={coin.href} className={rowLink}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{coin.league}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {coin.entry.toLocaleString("en-US")} entry · {coin.players} in · {poolLine(coin.entry, coin.players)}
              </p>
            </div>
            <span className="flex flex-col items-end">
              <CoinAmount value={splitPool(coin.entry, coin.players).pool} className="text-base" />
              <span className="text-[11px] text-muted-foreground">pool</span>
            </span>
          </Link>
        ) : (
          <Link href="/challenges/new" className={rowLink}>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold">Friends&apos; pool</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Start a league · entry from {ENTRY_TIERS[0].toLocaleString("en-US")}
              </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
          </Link>
        )}

        <p className="border-t border-line px-4 py-2.5 text-xs text-muted-foreground">Points rank you on both. Coins in never change your rank.</p>
      </Card>
    </section>
  );
}
