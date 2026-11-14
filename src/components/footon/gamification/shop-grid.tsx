"use client";

import { Check, Lock } from "lucide-react";

import { Coin } from "@/components/footon/coin";
import { SectionHeading } from "@/components/footon/section-heading";
import { formatNumber } from "@/lib/gamification/format";
import type { ShopItem, ShopSlot } from "@/lib/gamification/schemas";
import { copy } from "@/lib/gamification/strings";
import { cn } from "@/lib/utils";
import { ItemSwatch } from "./club-view";

export type ItemState = "locked" | "equipped" | "owned" | "new" | "buyable";

export function itemState(item: ShopItem, level: number): ItemState {
  if (level < item.requiredLevel) return "locked";
  if (item.equipped) return "equipped";
  if (item.owned && item.slot !== "freeze") return "owned";
  return item.isNew ? "new" : "buyable";
}

export function Price({ value, className }: { value: number; className?: string }) {
  if (value === 0) return <span className={cn("text-xs font-semibold text-muted-foreground", className)}>{copy.free}</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 font-display text-[17px] leading-none font-bold text-live", className)}>
      <Coin className="size-3.5 text-[7px]" />
      {formatNumber(value)}
      <span className="sr-only"> سکه</span>
    </span>
  );
}

/**
 * One item as a tappable tile. Every state reads by shape and words, not
 * colour alone: locked = dashed + lock + "Level X"; on your club = soft-lime
 * with a check; owned = "Owned"; new = an outlined "New" tag. Every tile
 * opens the preview, locked ones included (you can always look).
 */
export function ShopItemCard({ item, level, onSelect }: { item: ShopItem; level: number; onSelect: (item: ShopItem) => void }) {
  const state = itemState(item, level);
  const label =
    state === "locked"
      ? copy.levelRequired(item.requiredLevel)
      : state === "equipped"
        ? copy.equipped
        : state === "owned"
          ? copy.owned
          : `${state === "new" ? `${copy.isNew}، ` : ""}${copy.priceAria(item.price.free)}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      aria-label={copy.itemAria(item.name, label)}
      data-state={state}
      className={cn(
        "relative flex w-full min-w-0 flex-col gap-2 rounded-xl border p-2.5 text-start outline-none transition-[transform,border-color] duration-200 ease-spring focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-[0.97]",
        state === "locked" && "bg-dots border-dashed border-line-strong",
        state === "equipped" && "border-primary-line bg-primary-soft",
        (state === "owned" || state === "new" || state === "buyable") && "border-line bg-surface hover:border-line-strong",
      )}
    >
      <ItemSwatch slot={item.slot} look={item.look} className={cn("h-[84px] w-full", state === "locked" && "opacity-50")} />
      {state === "new" && (
        <span aria-hidden="true" className="absolute end-2 top-2 rounded-full border border-line-strong bg-surface-2 px-2 py-0.5 text-[11px] font-semibold">
          {copy.isNew}
        </span>
      )}
      <span aria-hidden="true" className={cn("truncate text-[13px] font-semibold", state === "locked" && "text-muted-foreground")}>
        {item.name}
      </span>
      <span aria-hidden="true" className="flex h-5 items-center gap-1 text-xs text-muted-foreground">
        {state === "locked" && (
          <>
            <Lock className="size-3.5" strokeWidth={2.2} />
            {copy.levelN(item.requiredLevel)}
          </>
        )}
        {state === "equipped" && (
          <span className="flex items-center gap-1 font-semibold text-primary">
            <Check className="size-3.5" strokeWidth={2.6} />
            {copy.equipped}
          </span>
        )}
        {state === "owned" && copy.owned}
        {(state === "new" || state === "buyable") && <Price value={item.price.free} />}
      </span>
    </button>
  );
}

const ORDER: ShopSlot[] = ["freeze", "kit", "stadium", "boots", "frame"];

/** The catalogue in sections (Keep your run, Kits, Stadiums, Boots, Frames), two tiles a row. */
export function ShopGrid({ items, level, onSelect }: { items: ShopItem[]; level: number; onSelect: (item: ShopItem) => void }) {
  return (
    <>
      {ORDER.map((slot) => {
        const list = items.filter((i) => i.slot === slot);
        if (list.length === 0) return null;
        return (
          <section key={slot} aria-labelledby={`shop-${slot}`} className="flex flex-col gap-2.5">
            <SectionHeading id={`shop-${slot}`} title={copy.shopSection[slot]} />
            <ul className="grid grid-cols-2 gap-2">
              {list.map((item) => (
                <li key={item.id} className="flex">
                  <ShopItemCard item={item} level={level} onSelect={onSelect} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
