"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellRing, Check, Flag, Layers, MessageSquareQuote, PartyPopper, Shield, Shirt, Snowflake, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ShopItem } from "@/lib/mock-data";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { Coin } from "./coin";

const icons = {
  pack: Layers,
  celebration: PartyPopper,
  banter: MessageSquareQuote,
  banner: Flag,
  freeze: Snowflake,
  league: Shield,
  kit: Shirt,
  slot: UserPlus,
} satisfies Record<ShopItem["icon"], unknown>;

const fmt = (n: number) => n.toLocaleString("en-US");

function Price({ item, className }: { item: ShopItem; className?: string }) {
  if (item.price) return <span className={cn("font-display text-lg font-bold", className)}>{item.price}</span>;
  if (item.coins == null) return null;
  const label = Array.isArray(item.coins) ? `${fmt(item.coins[0])}–${fmt(item.coins[1])}` : fmt(item.coins);
  return (
    <span className={cn("inline-flex items-center gap-1 font-display text-lg font-bold text-live", className)}>
      {label}
      <Coin className="size-4 text-[8px]" />
      <span className="sr-only">coins</span>
    </span>
  );
}

/**
 * The Phase 2 shop: real items at real prices, nothing for sale yet. Tapping
 * an item opens a sheet that says so plainly ("coming soon", never "sold
 * out") and offers to let you know; those taps are what we measure.
 */
export function Shop({ groups }: { groups: { group: string; note?: string; items: ShopItem[] }[] }) {
  const [open, setOpen] = useState<ShopItem | null>(null);
  const [notified, setNotified] = useState<string[]>([]);
  const isOn = open ? notified.includes(open.id) : false;

  useEffect(() => track("shop_open"), []);

  const pick = (item: ShopItem) => {
    track("shop_item_tap", { item: item.id });
    setOpen(item);
  };
  const notify = () => {
    if (!open) return;
    track("shop_notify", { item: open.id });
    setNotified((n) => [...n, open.id]);
  };

  return (
    <>
      {groups.map((g) => (
        <section key={g.group} aria-labelledby={`g-${g.group}`} className="flex flex-col gap-2.5">
          <h2 id={`g-${g.group}`} className="flex items-baseline justify-between text-[13px] font-medium text-muted-foreground">
            {g.group}
            {g.note && <span className="text-xs">{g.note}</span>}
          </h2>
          <Card className="overflow-hidden">
            {g.items.map((item) => {
              const Icon = icons[item.icon];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pick(item)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-start outline-none transition-colors hover:bg-[#141417] focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60 [&+&]:border-t [&+&]:border-line"
                >
                  <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-surface-3 text-muted-foreground">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-semibold">
                        {item.pack ? `${fmt(item.pack.coins)} coins` : item.name}
                      </span>
                      {item.pack?.bonus && <Badge variant="live">+{item.pack.bonus}%</Badge>}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.pack ? item.name : item.detail}</span>
                  </span>
                  {notified.includes(item.id) ? (
                    <Badge variant="soft">
                      <BellRing aria-hidden="true" />
                      Notify on
                    </Badge>
                  ) : (
                    <Price item={item} />
                  )}
                </button>
              );
            })}
          </Card>
        </section>
      ))}

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        {open && (
          <DialogContent>
            <DialogHeader>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">COMING SOON</p>
              <DialogTitle>{open.pack ? `${fmt(open.pack.coins)} coins` : open.name}</DialogTitle>
              <DialogDescription>
                {open.pack ? `${open.name} pack${open.pack.bonus ? `, ${open.pack.bonus}% extra coins` : ""}.` : `${open.detail}.`} The shop
                isn&apos;t open yet and nothing is charged. Want us to tell you when it is?
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-between rounded-md border border-line bg-surface px-4 py-3">
              <span className="text-[13px] text-muted-foreground">Price when it opens</span>
              <Price item={open} />
            </div>
            <DialogFooter>
              <AnimatePresence mode="wait" initial={false}>
                {isOn ? (
                  <motion.p
                    key="on"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-14 items-center justify-center gap-2 rounded-lg border border-primary-line bg-primary-soft text-[15px] font-semibold text-primary"
                    aria-live="polite"
                  >
                    <Check className="size-[18px]" strokeWidth={2.6} aria-hidden="true" />
                    We&apos;ll let you know
                  </motion.p>
                ) : (
                  <motion.div key="ask" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <Button size="lg" className="w-full font-bold" onClick={notify}>
                      <BellRing className="size-[18px]" strokeWidth={2.4} aria-hidden="true" />
                      Notify me
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
