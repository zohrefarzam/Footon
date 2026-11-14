"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CircleDot, Flag, Goal, Lock, Pencil, Swords, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PREDICTION_MIN_STAKE, STAKE_STEPS, formatCoins, payout, POINTS_PER_RIGHT_CALL } from "@/lib/economy";
import type { ChallengeRules, Team } from "@/lib/mock-data";
import {
  PREDICTION_LABELS,
  PREDICTION_TYPES,
  parseScore,
  predictionOptions,
  predictionSummary,
  scorePick,
  type Prediction,
  type PredictionType,
} from "@/lib/predictions";
import { newIdempotencyKey, outbox, useOutboxEntry, type OutboxEntry } from "@/lib/gamification/outbox";
import { userTimeZone } from "@/lib/gamification/day";
import { cn } from "@/lib/utils";
import { BoostBadge } from "./boost-badge";
import { Coin, CoinAmount } from "./coin";
import { Football } from "./football";
import { ScorePicker } from "./score-picker";
import { formatNumber, toLatinDigits } from "@/lib/format";

export function TypeIcon({ type, className }: { type: PredictionType; className?: string }) {
  const c = cn("size-4 shrink-0", className);
  switch (type) {
    case "score":
      return <Goal className={c} aria-hidden="true" />;
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
  match: {
    id: string;
    status: "live" | "upcoming" | "finished";
    kickoff?: string;
    /** Kickoff instant (ISO): the server keys the streak day from it. */
    kickoffAt?: string;
    home: string;
    away: string;
    boost?: boolean;
  };
  /** Both sides, for the score picker's crests. Falls back to the names. */
  teams?: { home: Team; away: Team };
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
export function PredictionBuilder({ match: m, teams, initial = [], rules, balance }: PredictionBuilderProps) {
  const open = m.status === "upcoming";
  const [items, setItems] = useState<Prediction[]>(initial);
  const [locked, setLocked] = useState(initial.length > 0);
  const [seq, setSeq] = useState(0);
  const [sendKey, setSendKey] = useState<string | null>(null);
  const sending = useOutboxEntry(sendKey);
  /** Set when you lock in during this visit: drives the confirmation. */
  const [justLocked, setJustLocked] = useState(false);
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
  const scoreItem = items.find((p) => p.type === "score");
  const setScore = ([h, a]: [number, number]) => {
    if (scoreItem) update(scoreItem.id, { pick: scorePick(h, a) });
    else {
      setItems((xs) => [{ id: `new-${seq}`, type: "score", pick: scorePick(h, a), stake: minFor("score") }, ...xs]);
      setSeq((n) => n + 1);
    }
  };
  const sides = teams ?? {
    home: { code: m.home.slice(0, 3).toUpperCase(), name: m.home },
    away: { code: m.away.slice(0, 3).toUpperCase(), name: m.away },
  };
  // the slip is saved the moment you lock it; the server call (and any
  // reward) follows, and a failed send stays retryable with the same key
  const lockIn = () => {
    setLocked(true);
    setJustLocked(true);
    const key = newIdempotencyKey(`pred_${m.id}`);
    setSendKey(key);
    void outbox.getState().send({
      kind: "prediction",
      input: { idempotencyKey: key, matchId: m.id, kickoff: m.kickoffAt ?? new Date().toISOString(), count: items.length, timeZone: userTimeZone() },
    });
  };
  const edit = () => {
    setLocked(false);
    setJustLocked(false);
  };

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
          پیش‌بینی‌های تو
        </h2>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          {m.boost && <BoostBadge />}
          {/* status: draft (dashed) → locked in (soft lime, check) → locked at kickoff (lock) */}
          {!open ? (
            <span className="flex h-6 items-center gap-1 rounded-full bg-surface-3 px-2.5 font-semibold text-foreground">
              <Lock className="size-3" strokeWidth={2.6} aria-hidden="true" />
              با شروع بازی قفل شد
            </span>
          ) : locked ? (
            <span className="flex h-6 items-center gap-1 rounded-full border border-primary-line bg-primary-soft px-2.5 font-semibold text-primary">
              <Check className="size-3" strokeWidth={3} aria-hidden="true" />
              ثبت شد
            </span>
          ) : items.length > 0 ? (
            <span className="flex h-6 items-center rounded-full border border-dashed border-line-strong px-2.5 font-semibold">پیش‌نویس</span>
          ) : null}
          {open && (
            <span>
              تا <span className="font-display text-sm font-bold text-foreground">{m.kickoff}</span>
            </span>
          )}
        </span>
      </div>

      {rules && (
        <p className="text-xs text-muted-foreground">
          {rules.league}:{" "}
          {fixed ? (
            <>
              <span className="font-display text-sm font-bold text-live">{formatCoins(fixed)}</span> برای هر پیش‌بینی
              {rules.setBy ? `، تعیین‌شده توسط ${rules.setBy}` : ""}
            </>
          ) : (
            "مبلغ هر پیش‌بینی با خودت"
          )}
          {rules.cap ? (
            <>
              {" "}
              • سقف <span className="font-display text-sm font-bold text-foreground">{formatCoins(rules.cap)}</span>
            </>
          ) : null}
        </p>
      )}

      {editing && <ScorePicker home={sides.home} away={sides.away} value={scoreItem ? parseScore(scoreItem.pick) : undefined} onChange={setScore} />}

      {editing && (
        <ul className="grid grid-cols-3 gap-2" aria-label="افزودن پیش‌بینی">
          {PREDICTION_TYPES.filter((t) => t !== "score").map((t) => {
            const on = items.some((p) => p.type === t);
            return (
              <li key={t}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleType(t)}
                  className={cn(
                    "flex h-[60px] w-full flex-col items-start justify-between rounded-lg border px-2.5 py-2 text-start outline-none transition-[transform,background-color,border-color] duration-200 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60",
                    on ? "border-primary-line bg-primary-soft text-primary" : "border-line bg-surface hover:bg-surface-hover",
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
                        <Button variant="ghost" size="icon-sm" className="-me-2 size-9" aria-label={`حذف ${label}`} onClick={() => toggleType(p.type)}>
                          <X />
                        </Button>
                      </div>

                      {p.type === "score" ? (
                        <p className="flex items-center justify-between gap-3 rounded-sm border border-primary-line bg-primary-soft px-3 py-2 text-[13px] font-semibold text-primary">
                          <span className="truncate">{predictionSummary(p, m.home, m.away)}</span>
                          <span className="shrink-0 text-xs font-medium text-muted-foreground">بالا عوضش کن</span>
                        </p>
                      ) : (
                      <div role="radiogroup" aria-label={`${label}: انتخاب تو`} className="flex gap-1.5">
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
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        {fixed ? (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            مبلغ <CoinAmount value={fixed} className="text-[15px]" />
                            {rules?.setBy && <span>تعیین‌شده توسط {rules.setBy}</span>}
                          </span>
                        ) : (
                          <>
                            <label htmlFor={`stake-${p.id}`} className="text-xs text-muted-foreground">
                              مبلغ
                            </label>
                            <div className="relative">
                              <input
                                id={`stake-${p.id}`}
                                inputMode="numeric"
                                autoComplete="off"
                                value={p.stake ? String(p.stake) : ""}
                                onChange={(e) => update(p.id, { stake: Number(toLatinDigits(e.target.value).replace(/\D/g, "").slice(0, 5)) || 0 })}
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
                              دست‌کم {formatCoins(min)}
                            </span>
                          </>
                        )}
                        <span className="ms-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                          برد <CoinAmount value={payout(p.stake, m.boost)} className="text-[15px]" />
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
                        <p className="mt-0.5 text-xs text-muted-foreground">{formatCoins(p.stake)} سکه شرط</p>
                      </div>
                      {p.result === "right" ? (
                        <span className="flex flex-col items-end gap-0.5">
                          <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                            درست
                          </span>
                          <CoinAmount value={payout(p.stake, m.boost)} signed className="text-[15px]" />
                        </span>
                      ) : p.result === "wrong" ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-loss">
                          <X className="size-3.5" strokeWidth={3} aria-hidden="true" />
                          غلط
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          برد <CoinAmount value={payout(p.stake, m.boost)} className="text-[15px]" />
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
          {open ? "یکی از نوع‌های بالا را بزن تا اولین پیش‌بینی‌ات اضافه شود." : "روی این بازی پیش‌بینی‌ای نداری."}
        </p>
      )}

      {/* footer: totals and the one action */}
      <div aria-live="polite" className="flex flex-col gap-2.5">
        {open && items.length > 0 && (
          <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              شرط <span className="font-display text-sm font-bold text-foreground">{formatCoins(total)}</span>
              {rules?.cap ? ` از سقف ${formatCoins(rules.cap)}` : ""} • موجودی {formatCoins(balance)}
            </span>
            <span>
              همه درست: <CoinAmount value={wins} className="text-sm" /> + {formatNumber(items.length * POINTS_PER_RIGHT_CALL)} امتیاز
            </span>
          </p>
        )}

        {editing && items.length > 0 && (
          <>
            {overCap > 0 ? (
              <Button size="lg" disabled>
                {formatCoins(overCap)} بیشتر از سقف
              </Button>
            ) : short > 0 ? (
              <Button size="lg" disabled>
                {formatCoins(short)} سکهٔ دیگر لازم داری
              </Button>
            ) : unpicked > 0 ? (
              <Button size="lg" disabled>
                برای {formatNumber(unpicked)} مورد دیگر جواب انتخاب کن
              </Button>
            ) : (
              <Button size="lg" disabled={lowStake} onClick={lockIn} className="justify-between ps-5 pe-4">
                <span>
                  ثبت {formatNumber(items.length)} پیش‌بینی
                </span>
                <span className="flex items-center gap-1 font-display text-base font-bold">
                  {formatCoins(total)}
                  <Coin className="size-4 text-[8px]" />
                  <span className="sr-only">سکه</span>
                </span>
              </Button>
            )}
            {short > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                جایزه‌های جدول رایگان و مأموریت‌ها سکه‌ات را پر می‌کنند.{" "}
                <Link href="/wallet" className="font-semibold text-foreground underline underline-offset-3">
                  راه‌های گرفتن سکه
                </Link>
              </p>
            )}
          </>
        )}

        {open && locked && justLocked && (
          <div role="status" className="animate-in-up flex items-center gap-3 rounded-xl border border-primary-line bg-primary-soft px-4 py-3">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0 text-primary">
              <circle cx="12" cy="12" r="11" fill="currentColor" opacity=".18" />
              <path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="animate-draw [stroke-dasharray:1]" pathLength={1} />
            </svg>
            <p className="text-sm">
              <span className="font-semibold text-primary">
                {formatNumber(items.length)} پیش‌بینی ثبت شد.
              </span>{" "}
              <span className="text-muted-foreground">تا {m.kickoff} می‌توانی عوضشان کنی.</span>
            </p>
          </div>
        )}
        <SyncStatus entry={sending} onRetry={() => sendKey && void outbox.getState().retry(sendKey)} />

        {open && locked && (
          <Button variant="secondary" size="lg" onClick={edit}>
            <Pencil aria-hidden="true" />
            ویرایش پیش‌بینی‌ها
          </Button>
        )}
      </div>
    </section>
  );
}

/** "Saved" is never in doubt; this only says whether the server has it yet. */
function SyncStatus({ entry, onRetry }: { entry: OutboxEntry | undefined; onRetry: () => void }) {
  return (
    <div aria-live="polite" className="empty:hidden">
      {entry?.status === "sending" && <p className="text-shimmer text-center text-xs">ذخیره شد • در حال همگام‌سازی</p>}
      {entry?.status === "failed" && (
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          روی همین گوشی ذخیره شد، هنوز فرستاده نشده.
          <Button variant="secondary" size="sm" className="h-8 rounded-sm px-3" onClick={onRetry}>
            دوباره
          </Button>
        </p>
      )}
    </div>
  );
}
