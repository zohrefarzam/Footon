"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { Coin } from "@/components/footon/coin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/gamification/api/client";
import { formatNumber } from "@/lib/gamification/format";
import { tierFor } from "@/lib/gamification/level";
import { newIdempotencyKey } from "@/lib/gamification/outbox";
import { useEquip, useLevel, useMyClub, usePurchase } from "@/lib/gamification/queries";
import type { ShopItem } from "@/lib/gamification/schemas";
import { copy } from "@/lib/gamification/strings";
import { MyClubView } from "./club-view";
import { itemState } from "./shop-grid";
import { FreezeIndicator } from "./streak";

/**
 * Try an item on your own club before buying it. The footer is the one action
 * that fits the item's state: Buy (→ PurchaseConfirm), Put it on, or the
 * reason you can't (level, coins, freezes full). Never a pressure prompt.
 */
export function ItemPreview({ item, open, onOpenChange }: { item: ShopItem | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const lv = useLevel();
  const club = useMyClub().data;
  const [confirming, setConfirming] = useState(false);
  const [boughtId, setBoughtId] = useState<string | null>(null);

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setConfirming(false);
      setBoughtId(null);
    }
  };

  if (!item || !lv) return null;
  const state = itemState(item, lv.progress.level);
  const balance = lv.progress.coins.free + (lv.flags.premiumCoins ? lv.progress.coins.premium : 0);
  const short = item.price.free - balance;
  const freezesFull = item.slot === "freeze" && lv.progress.streak.freezesHeld >= lv.config.streak.maxFreezes;
  const bought = boughtId === item.id;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent closeLabel={copy.close}>
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>{item.detail ?? copy.previewOn}</DialogDescription>
        </DialogHeader>

        {item.slot === "freeze" ? (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
            <FreezeIndicator held={lv.progress.streak.freezesHeld} max={lv.config.streak.maxFreezes} />
            <span className="text-xs text-muted-foreground">{copy.freezes(lv.progress.streak.freezesHeld, lv.config.streak.maxFreezes)}</span>
          </div>
        ) : club ? (
          <MyClubView
            club={club}
            tierName={tierFor(club.level, lv.config).name}
            size="compact"
            preview={{ slot: item.slot, item: { id: item.id, name: item.name, look: item.look } }}
          />
        ) : (
          <Skeleton className="h-[230px] rounded-3xl" />
        )}

        {bought ? (
          <Bought item={item} onDone={() => close(false)} />
        ) : confirming ? (
          <PurchaseConfirm item={item} balance={balance} premium={lv.flags.premiumCoins ? lv.progress.coins.premium : 0} onCancel={() => setConfirming(false)} onBought={() => setBoughtId(item.id)} />
        ) : (
          <div className="flex flex-col gap-2">
            {state === "locked" ? (
              <Button size="lg" disabled>
                {copy.levelRequired(item.requiredLevel)}
              </Button>
            ) : state === "equipped" ? (
              <Button size="lg" variant="soft" disabled>
                {copy.equipped}
              </Button>
            ) : state === "owned" ? (
              <EquipButton itemId={item.id} />
            ) : freezesFull ? (
              <Button size="lg" disabled>
                {copy.freezeFull(lv.config.streak.maxFreezes)}
              </Button>
            ) : short > 0 ? (
              <>
                <Button size="lg" disabled>
                  {copy.needMore(short)}
                </Button>
                <Link href="/wallet" className="text-center text-xs font-semibold underline underline-offset-3">
                  {copy.waysToEarn}
                </Link>
              </>
            ) : (
              <Button size="lg" onClick={() => setConfirming(true)} className="justify-between ps-5 pe-4">
                <span>{copy.buyLabel}</span>
                <span className="flex items-center gap-1 font-display text-base font-bold">
                  {formatNumber(item.price.free)}
                  <Coin className="size-4 text-[8px]" />
                  <span className="sr-only">coins</span>
                </span>
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EquipButton({ itemId, onDone }: { itemId: string; onDone?: () => void }) {
  const equip = useEquip();
  return (
    <>
      <Button size="lg" disabled={equip.isPending} onClick={() => equip.mutate(itemId, { onSuccess: onDone })}>
        {equip.isPending ? copy.equipping : copy.equip}
      </Button>
      {equip.isError && (
        <p aria-live="polite" className="text-center text-xs text-muted-foreground">
          {copy.conflict}
        </p>
      )}
    </>
  );
}

/**
 * The last step before coins move. The confirm button is disabled from the
 * tap until the server answers, and a retry after a failed request reuses the
 * same idempotency key, so one tap can never charge twice. The balance shown
 * after the buy is the server's.
 */
export function PurchaseConfirm({
  item,
  balance,
  premium,
  onCancel,
  onBought,
}: {
  item: ShopItem;
  balance: number;
  premium: number;
  onCancel: () => void;
  onBought: () => void;
}) {
  const purchase = usePurchase();
  const [key, setKey] = useState(() => newIdempotencyKey(`buy_${item.id}`));
  const price = item.price.free;
  const err = purchase.error instanceof ApiError ? purchase.error : purchase.error ? new ApiError("server") : null;
  const freeFirst = Math.min(balance - premium, price);

  const buy = () => {
    if (purchase.isPending) return;
    purchase.mutate(
      { itemId: item.id, idempotencyKey: key, price },
      {
        onSuccess: onBought,
        // only a definite refusal gets a new key; a lost request retries with the same one
        onError: (e) => {
          if (e instanceof ApiError && !e.retryable) setKey(newIdempotencyKey(`buy_${item.id}`));
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[15px] font-semibold">{copy.confirmTitle(item.name)}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{copy.confirmBody(price, balance - price)}</p>
        {premium > 0 && price > freeFirst && <p className="mt-0.5 text-xs text-muted-foreground">{copy.confirmSplit(freeFirst, price - freeFirst)}</p>}
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground empty:hidden">
        {err ? (err.code === "insufficient_balance" ? copy.noFunds : err.code === "conflict" ? copy.conflict : copy.offline) : ""}
      </p>
      <div className="flex gap-2.5">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onCancel} disabled={purchase.isPending}>
          {copy.cancel}
        </Button>
        <Button size="lg" className="flex-1" onClick={buy} disabled={purchase.isPending || err?.code === "conflict" || err?.code === "insufficient_balance"}>
          {purchase.isPending ? copy.buying : err?.retryable ? copy.tryAgain : copy.confirm}
        </Button>
      </div>
    </div>
  );
}

function Bought({ item, onDone }: { item: ShopItem; onDone: () => void }) {
  const reduce = useReducedMotion();
  const wearable = item.slot !== "freeze";
  return (
    <div className="flex flex-col gap-3">
      <p aria-live="polite" className="flex items-center gap-2 text-[15px] font-semibold">
        <svg viewBox="0 0 24 24" className="size-6 text-primary" aria-hidden="true">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </svg>
        {copy.bought}
      </p>
      {wearable ? <EquipButton itemId={item.id} onDone={onDone} /> : null}
      <Button variant="secondary" size="lg" onClick={onDone}>
        {copy.done}
      </Button>
    </div>
  );
}
