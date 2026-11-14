"use client";

import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";

import { useLevel, useShop } from "@/lib/gamification/queries";
import { copy } from "@/lib/gamification/strings";
import { cn } from "@/lib/utils";
import { ItemSwatch } from "./gamification/club-view";
import { Price } from "./gamification/shop-grid";
import { formatNumber } from "@/lib/format";

/**
 * The shop on Home: a full-width dotted card with three items you could get
 * now (newly unlocked first), so it's visible without being a sales prompt.
 * Neutral, never lime. Hidden when your balance can't cover any of them: no
 * shop on a low balance (see the economy rules). Links to /shop.
 */
export function ShopPreview({ className }: { className?: string }) {
  const shop = useShop().data;
  const lv = useLevel();
  if (!shop || !lv) return null;

  const coins = lv.progress.coins.free;
  const open = shop.items.filter((i) => lv.progress.level >= i.requiredLevel && !i.owned && i.price.free > 0);
  if (open.length === 0 || open.every((i) => i.price.free > coins)) return null;
  const picks = [...open.filter((i) => i.isNew), ...open.filter((i) => !i.isNew)].slice(0, 3);
  const fresh = open.filter((i) => i.isNew).length;

  return (
    <Link
      href="/shop"
      aria-label={`${copy.shopTitle}${fresh ? `، ${formatNumber(fresh)} ${copy.isNew}` : ""}: ${picks.map((i) => i.name).join("، ")}`}
      className={cn(
        "group bg-dots flex flex-col gap-3 rounded-xl border border-line-strong bg-surface p-3.5 outline-none transition-colors duration-300 hover:border-[#2c4d3f] focus-visible:ring-[3px] focus-visible:ring-ring/60",
        className,
      )}
    >
      <span className="flex items-center gap-2.5">
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-surface-3">
          <ShoppingBag className="size-[18px]" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-[15px] font-semibold">{copy.shopTitle}</span>
            {fresh > 0 && (
              <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {formatNumber(fresh)} {copy.isNew}
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{copy.shopBlurb}</span>
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180"
          aria-hidden="true"
        />
      </span>

      <span aria-hidden="true" className="grid grid-cols-3 gap-2">
        {picks.map((item) => (
          <span key={item.id} className="flex min-w-0 flex-col gap-2 rounded-md border border-line bg-surface-2 p-2">
            <ItemSwatch slot={item.slot} look={item.look} className="h-12 w-full bg-surface" />
            <span className="truncate text-xs font-semibold">{item.name}</span>
            <Price value={item.price.free} className="text-[15px]" />
          </span>
        ))}
      </span>
    </Link>
  );
}
