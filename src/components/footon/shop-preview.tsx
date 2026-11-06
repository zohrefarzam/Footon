import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";

import type { ShopItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Coin } from "./coin";
import { formatShopCoins, shopIcons } from "./shop-icons";

/**
 * The shop on Home: a full-width card with three real items and their coin
 * prices, so it's visible without being a sales prompt. Neutral (no lime: it's
 * never the main action), "Opening soon" stated plainly. Links to /shop.
 * Home doesn't show it after a loss or on a low balance (see the economy rules).
 */
export function ShopPreview({ items, className }: { items: ShopItem[]; className?: string }) {
  return (
    <Link
      href="/shop"
      aria-label={`Shop, opening soon: ${items.map((i) => i.name).join(", ")}`}
      className={cn(
        "group bg-dots flex flex-col gap-3 rounded-xl border border-line-strong bg-surface p-3.5 outline-none transition-colors duration-300 hover:border-[#3a3a42] focus-visible:ring-[3px] focus-visible:ring-ring/60",
        className,
      )}
    >
      <span className="flex items-center gap-2.5">
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-surface-3">
          <ShoppingBag className="size-[18px]" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-[15px] font-semibold">Shop</span>
            <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">Opening soon</span>
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">Celebrations, banter, league looks</span>
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180"
          aria-hidden="true"
        />
      </span>

      <span aria-hidden="true" className="grid grid-cols-3 gap-2">
        {items.map((item) => {
          const Icon = shopIcons[item.icon];
          return (
            <span key={item.id} className="flex min-w-0 flex-col gap-2 rounded-md border border-line bg-surface-2 p-2.5">
              <Icon className="size-[18px] text-muted-foreground" />
              <span className="line-clamp-2 min-h-8 text-xs leading-4 font-semibold">{item.name}</span>
              {item.coins != null && (
                <span className="flex items-center gap-1 font-display text-[15px] leading-none font-bold text-live">
                  {Array.isArray(item.coins) && <span className="font-sans text-[11px] font-medium text-muted-foreground">from</span>}
                  <span className="truncate">{formatShopCoins(Array.isArray(item.coins) ? item.coins[0] : item.coins)}</span>
                  <Coin className="size-3.5 text-[7px]" />
                </span>
              )}
            </span>
          );
        })}
      </span>
    </Link>
  );
}
