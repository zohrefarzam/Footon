import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { Shop } from "@/components/footon/shop";
import { Button } from "@/components/ui/button";
import { shop } from "@/lib/mock-data";

/**
 * Shop, Phase 2: "coming soon". Real items and prices so we can measure intent
 * (opens, item taps, "Notify me") before building payment. Reached only from
 * the Wallet header; never offered after a loss or when coins run low.
 */
export default function ShopPage() {
  return (
    <AppShell>
      <header className="flex items-center gap-3">
        <Button asChild variant="secondary" size="icon-sm" aria-label="Back to wallet" className="rounded-[11px]">
          <Link href="/wallet">
            <ChevronLeft className="rtl:rotate-180" />
          </Link>
        </Button>
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">Shop</h1>
      </header>
      <p className="-mt-2 text-sm text-muted-foreground">Opening soon. Nothing here is charged yet.</p>

      <Shop groups={shop} />

      <p className="text-center text-xs text-balance text-muted-foreground">
        Bought coins are for more play and extras. They never buy points, rank or prizes. No mystery boxes, and coins can&apos;t be cashed
        out.
      </p>
    </AppShell>
  );
}
