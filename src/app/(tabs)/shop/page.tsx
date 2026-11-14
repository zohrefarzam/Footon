import { AppShell } from "@/components/footon/app-shell";
import { BackButton } from "@/components/footon/back-button";
import { ShopView } from "@/components/footon/gamification/shop-view";
import { copy } from "@/lib/gamification/strings";

/**
 * The cosmetic shop: kits, stadiums, boots, frames and the Streak Freeze for
 * your club. Every item shows, locked ones with their level; you can try any
 * of them on before buying. Reached from the Wallet header and Home's shop
 * card; never offered after a loss or on a low balance.
 */
export default function ShopPage() {
  return (
    <AppShell>
      <header className="flex items-center gap-3">
        <BackButton href="/wallet" />
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">{copy.shopTitle}</h1>
      </header>
      <p className="-mt-2 text-sm text-muted-foreground">{copy.shopIntro}</p>

      <ShopView />

      <p className="text-center text-xs text-balance text-muted-foreground">{copy.shopRules}</p>
    </AppShell>
  );
}
