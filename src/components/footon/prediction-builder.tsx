"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CircleDot, Flag, Pencil, Swords, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PREDICTION_MIN_STAKE, STAKE_STEPS, formatCoins, payout, POINTS_PER_RIGHT_CALL } from "@/lib/economy";
import type { ChallengeRules } from "@/lib/mock-data";
import {
  PREDICTION_LABELS,
  PREDICTION_TYPES,
  predictionOptions,
  predictionSummary,
  type Prediction,
  type PredictionType,
} from "@/lib/predictions";
import { cn } from "@/lib/utils";
import { BoostBadge } from "./boost-badge";
import { Coin, CoinAmount } from "./coin";
import { Football } from "./football";

function TypeIcon({ type, className }: { type: PredictionType; className?: string }) {
  const c = cn("size-4 shrink-0", className);
  switch (type) {
    case "result":
      return <Swords className={c} aria-hidden="true" />;
    case "goals":
      return <Football className={c} />;
    case "corners":
      return <Flag className={c} aria-hidden="true" />;
    case "yellows":
      return <span aria-hidden="true" className="mx-1 h-3.5 w-2.5 shrink-0 rounded-[2px] bg-booking-yellow" />;
    case "red":
      return <span aria-hidden="true" className="mx-1 h-3.5 w-2.5 shrink-0 rounded-[2px] bg-booking-red" />;
    case "penalty":
      return <CircleDot className={c} aria-hidden="true" />;
  }
}

export type PredictionBuilderProps = {
  match: { id: string; status: "live" | "upcoming" | "finished"; kickoff?: string; home: string; away: string; boost?: boolean };
  /** What you've already locked on this match. */
  initial?: Prediction[];
  /** The challenge's stake rules, when you play this match in one. */
  rules?: ChallengeRules & { league: string; setBy?: string };
  balance: number;
};

/**
 * Set your own predictions on a match: tap a type (Win / draw, Goals, Corners,
 * Cards, Penalty) to add it, pick an answer, put a stake on it, lock them in.
 * Until kickoff the slip stays editable; after it, it reads back right / wrong.
 * A challenge can fix the stake per prediction and cap the total.
 */
export function PredictionBuilder({ match: m, initial = [], rules, balance }: PredictionBuilderProps) {
  const open = m.status === "upcoming";
  const [items, setItems] = useState<Prediction[]>(initial);
  const [locked, setLocked] = useState(initial.length > 0);
  const [seq, setSeq] = useState(0);
  const fixed = rules && rules.stake !== "free" ? rules.stake.fixed : undefined;
  const editing = open && !locked;

  const minFor = (t: PredictionType) => fixed ?? PREDICTION_MIN_STAKE[t];
  const toggleType = (t: PredictionType) => {
    if (items.some((p) => p.type === t)) setItems((xs) => xs.filter((p) => p.type !== t));
    else {
      setItems((xs) => [...xs, { id: `new-${seq}`, type: t, pick: "", stake: minFor(t) }]);
      setSeq((n) => n + 1);
    }
  };
  const update = (id: string, patch: Partial<Prediction>) => setItems((xs) => xs.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const total = items.reduce((s, p) => s + p.stake, 0);
  const wins = items.reduce((s, p) => s + payout(p.stake, m.boost), 0);
  const unpicked = items.filter((p) => !p.pick).length;
  const lowStake = items.some((p) => p.stake < minFor(p.type));
  const overCap = rules?.cap ? total - rules.cap : 0;
  const short = total - balance;

  return (
    <section aria-labelledby={`pred-${m.id}`} className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={`pred-${m.id}`} className="text-[13px] font-medium text-muted-foreground">
          Your predictions
        </h2>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          {m.boost && <BoostBadge />}
          {open ? (
            <>
              Editable until <span className="font-display text-sm font-bold text-foreground">{m.kickoff}</span>
            </>
          ) : (
            "Locked at kickoff"
          )}
        </span>
      </div>

      {rules && (
        <p className="text-xs text-muted-foreground">
          {rules.league}:{" "}
          {fixed ? (
            <>
              <span className="font-display text-sm font-bold text-live">{formatCoins(fixed)}</span> per prediction
              {rules.setBy ? `, set by ${rules.setBy}` : ""}
            </>
          ) : (
            "you pick each stake"
          )}
          {rules.cap ? (
            <>
              {" "}
              · cap <span className="font-display text-sm font-bold text-foreground">{formatCoins(rules.cap)}</span>
            </>
          ) : null}
        </p>
      )}

      {editing && (
        <ul className="grid grid-cols-3 gap-2" aria-label="Add a prediction">
          {PREDICTION_TYPES.map((t) => {
            const on = items.some((p) => p.type === t);
            return (
              <li key={t}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleType(t)}
                  className={cn(
                    "flex h-[60px] w-full flex-col items-start justify-between rounded-lg border px-2.5 py-2 text-start outline-none transition-[transform,background-color,border-color] duration-200 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60",
                    on ? "border-primary-line bg-primary-soft text-primary" : "border-line bg-surface hover:bg-[#141417]",
                  )}
                >
                  <span className="flex w-full items-center gap-1.5">
                    <TypeIcon type={t} className={on ? "text-primary" : "text-muted-foreground"} />
                    {on && <Check className="ms-auto size-3.5" strokeWidth={3} aria-hidden="true" />}
                  </span>
                  <span className="w-full truncate text-[13px] font-semibold">{PREDICTION_LABELS[t]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 ? (
        <Card className="overflow-hidden">
          <ul>
            {items.map((p) => {
              const label = PREDICTION_LABELS[p.type];
              const min = minFor(p.type);
              return (
                <li key={p.id} className="animate-in-up flex flex-col gap-3 px-4 py-3.5 [&+&]:border-t [&+&]:border-line">
                  {editing ? (
                    <>
                      <div className="flex items-center gap-2.5">
                        <TypeIcon type={p.type} className="text-muted-foreground" />
                        <span className="flex-1 text-[15px] font-semibold">{label}</span>
                        <Button variant="ghost" size="icon-sm" className="-me-2 size-9" aria-label={`Remove ${label}`} onClick={() => toggleType(p.type)}>
                          <X />
                        </Button>
                      </div>

                      <div role="radiogroup" aria-label={`${label}: your pick`} className="flex gap-1.5">
                        {predictionOptions(p.type, m.home, m.away).map((o) => {
                          const on = p.pick === o.value;
                          return (
                            <button
                              key={o.value}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              onClick={() => update(p.id, { pick: o.value })}
                              className={cn(
                                "h-9 min-w-0 flex-1 truncate rounded-sm border px-2 text-[13px] font-semibold outline-none transition-[transform,background-color,border-color,color] duration-150 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60",
                                on ? "border-primary-line bg-primary-soft text-primary" : "border-line-strong bg-surface-2 text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {o.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        {fixed ? (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            Stake <CoinAmount value={fixed} className="text-[15px]" />
                            {rules?.setBy && <span>set by {rules.setBy}</span>}
                          </span>
                        ) : (
                          <>
                            <label htmlFor={`stake-${p.id}`} className="text-xs text-muted-foreground">
                              Stake
                            </label>
                            <div className="relative">
                              <input
                                id={`stake-${p.id}`}
                                inputMode="numeric"
                                autoComplete="off"
                                value={p.stake ? String(p.stake) : ""}
                                onChange={(e) => update(p.id, { stake: Number(e.target.value.replace(/\D/g, "").slice(0, 5)) || 0 })}
                                onBlur={() => p.stake < min && update(p.id, { stake: min })}
                                aria-describedby={`stake-min-${p.id}`}
                                className="h-9 w-[92px] rounded-sm border border-line-strong bg-surface-2 ps-2.5 pe-8 font-display text-base font-bold tabular-nums outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/60"
                              />
                              <Coin className="pointer-events-none absolute end-2 top-1/2 size-4 -translate-y-1/2 text-[8px]" />
                            </div>
                            <div className="flex gap-1">
                              {STAKE_STEPS.filter((s) => s >= min).map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => update(p.id, { stake: s })}
                                  aria-pressed={p.stake === s}
                                  className={cn(
                                    "h-8 rounded-full px-2.5 font-display text-[13px] font-bold outline-none transition-[transform,color,background-color] duration-150 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60",
                                    p.stake === s ? "bg-surface-3 text-foreground" : "text-muted-foreground hover:text-foreground",
                                  )}
                                >
                                  {formatCoins(s)}
                                </button>
                              ))}
                            </div>
                            <span id={`stake-min-${p.id}`} className={cn("sr-only", p.stake < min && "not-sr-only text-xs text-loss")}>
                              At least {formatCoins(min)}
                            </span>
                          </>
                        )}
                        <span className="ms-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                          Wins <CoinAmount value={payout(p.stake, m.boost)} className="text-[15px]" />
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <TypeIcon type={p.type} className="text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-[15px] font-semibold", p.result === "wrong" && "text-muted-foreground")}>
                          {predictionSummary(p, m.home, m.away)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{formatCoins(p.stake)} staked</p>
                      </div>
                      {p.result === "right" ? (
                        <span className="flex flex-col items-end gap-0.5">
                          <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                            Right
                          </span>
                          <CoinAmount value={payout(p.stake, m.boost)} signed className="text-[15px]" />
                        </span>
                      ) : p.result === "wrong" ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-loss">
                          <X className="size-3.5" strokeWidth={3} aria-hidden="true" />
                          Wrong
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          wins <CoinAmount value={payout(p.stake, m.boost)} className="text-[15px]" />
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      ) : (
        <p className="rounded-xl border border-dashed border-line-strong px-4 py-5 text-center text-sm text-muted-foreground">
          {open ? "Tap a type above to add your first prediction." : "No predictions on this match."}
        </p>
      )}

      {/* footer: totals and the one action */}
      <div aria-live="polite" className="flex flex-col gap-2.5">
        {open && items.length > 0 && (
          <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              Staked <span className="font-display text-sm font-bold text-foreground">{formatCoins(total)}</span>
              {rules?.cap ? ` of ${formatCoins(rules.cap)} cap` : ""} · you have {formatCoins(balance)}
            </span>
            <span>
              All right: <CoinAmount value={wins} className="text-sm" /> + {items.length * POINTS_PER_RIGHT_CALL} pts
            </span>
          </p>
        )}

        {editing && items.length > 0 && (
          <>
            {overCap > 0 ? (
              <Button size="lg" disabled>
                {formatCoins(overCap)} over the cap
              </Button>
            ) : short > 0 ? (
              <Button size="lg" disabled>
                Need {formatCoins(short)} more coins
              </Button>
            ) : unpicked > 0 ? (
              <Button size="lg" disabled>
                Pick an answer for {unpicked === 1 ? "1 more" : `${unpicked} more`}
              </Button>
            ) : (
              <Button size="lg" disabled={lowStake} onClick={() => setLocked(true)} className="justify-between ps-5 pe-4">
                <span>
                  Lock in {items.length} {items.length === 1 ? "prediction" : "predictions"}
                </span>
                <span className="flex items-center gap-1 font-display text-base font-bold">
                  {formatCoins(total)}
                  <Coin className="size-4 text-[8px]" />
                  <span className="sr-only">coins</span>
                </span>
              </Button>
            )}
            {short > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                Free table rewards and missions top you up.{" "}
                <Link href="/wallet" className="font-semibold text-foreground underline underline-offset-3">
                  Ways to earn
                </Link>
              </p>
            )}
          </>
        )}

        {open && locked && (
          <Button variant="secondary" size="lg" onClick={() => setLocked(false)}>
            <Pencil aria-hidden="true" />
            Edit predictions
          </Button>
        )}
      </div>
    </section>
  );
}
