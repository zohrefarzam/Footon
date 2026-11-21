import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { Coin } from "@/components/footon/coin";
import { CoinBalance } from "@/components/footon/gamification/coin-balance";
import { WalletLive, WalletSections } from "@/components/footon/wallet-sections";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { coinActivity, earnWays, profile, starter, wallet, weekly } from "@/lib/mock-data";
import { formatNumber } from "@/lib/format";

const fmt = formatNumber;

/**
 * Wallet: what you have, how to earn more, and where it went. Points, coins
 * and prizes are shown side by side once so nobody mixes them up; the shop is
 * one quiet button in the header, never pushed after a loss or a low balance.
 */
export default function WalletPage() {
  return (
    <AppShell>
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] leading-tight font-bold">کیف پول</h1>
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

      {process.env.NEXT_PUBLIC_GAMIFICATION_API ? (
        <WalletLive />
      ) : (
        <WalletSections starter={starter} weekly={{ mission: weekly.mission, caps: weekly.caps }} earnWays={earnWays} activity={coinActivity} />
      )}

      <p className="text-center text-xs text-muted-foreground text-balance">
        سکه نقد نمیشه و نمیشه برای دوستات بفرستی‌اش. با خرید سکه هم هیچ‌وقت امتیاز، رتبه یا جایزه نمی‌خری.
      </p>
    </AppShell>
  );
}
