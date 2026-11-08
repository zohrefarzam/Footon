"use client";

import { useEffect, useRef, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/gamification/api";
import { useLevel, useShop } from "@/lib/gamification/queries";
import type { ShopItem } from "@/lib/gamification/schemas";
import { track } from "@/lib/track";
import { ItemPreview } from "./item-preview";
import { ShopGrid } from "./shop-grid";

/**
 * The shop's body: the grid, and the try-on sheet for whichever tile you tap.
 * Opening it tells the server you've seen what's new (the "New" tags clear
 * next time, not while you're looking).
 */
export function ShopView() {
  const shop = useShop().data;
  const lv = useLevel();
  const [picked, setPicked] = useState<ShopItem | null>(null);
  const seen = useRef(false);

  useEffect(() => {
    if (!shop || seen.current) return;
    seen.current = true;
    track("shop_viewed", { surface: "shop" });
    void api.markShopSeen().catch(() => {});
  }, [shop]);

  if (!shop || !lv) return <Skeleton className="h-[420px] rounded-xl" />;

  // keep the open sheet in step with the server's latest copy of the item
  const current = picked ? (shop.items.find((i) => i.id === picked.id) ?? picked) : null;

  return (
    <>
      <ShopGrid items={shop.items} level={lv.progress.level} onSelect={setPicked} />
      <ItemPreview item={current} open={current !== null} onOpenChange={(o) => !o && setPicked(null)} />
    </>
  );
}
