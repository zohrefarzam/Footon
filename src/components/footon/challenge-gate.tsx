"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardRow } from "@/components/ui/card";
import { formatCoins } from "@/lib/economy";
import type { ChallengeRules } from "@/lib/mock-data";
import { Coin, CoinAmount } from "./coin";

type Props = {
  league: string;
  from: { name: string; initial: string };
  entry: number;
  players: number;
  rules: ChallengeRules;
  kickoff?: string;
  pool: string;
  balance: number;
  /** What opens once you accept: the prediction builder. */
  children: React.ReactNode;
};

/**
 * An invite on its challenge page: the rules up front (entry, stake per
 * prediction, cap, pool), lime Accept + secondary Decline. Accepting reveals
 * the predictions right here, so the next step is always on screen.
 */
export function ChallengeGate({ league, from, entry, players, rules, kickoff, pool, balance, children }: Props) {
  const [state, setState] = useState<"pending" | "accepted" | "declined">("pending");
  const reduce = useReducedMotion();
  const short = entry - balance;
  const fade = {
    initial: reduce ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: reduce ? 0 : 0.25 },
  } as const;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state === "pending" && (
        <motion.div key="pending" {...fade} className="flex flex-col gap-3">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
              <Avatar>
                <AvatarFallback>{from.initial}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">
                  {from.name} <span className="font-normal text-muted-foreground">invited you to</span> {league}
                </p>
                <p className="text-xs text-muted-foreground">
                  {players} in · answer before kickoff{kickoff ? `, ${kickoff}` : ""}
                </p>
              </div>
            </div>
            <dl>
              {[
                { k: "Entry", v: <CoinAmount value={entry} className="text-base" /> },
                {
                  k: "Each prediction",
                  v:
                    rules.stake === "free" ? (
                      <span className="text-sm font-semibold">You pick the stake</span>
                    ) : (
                      <CoinAmount value={rules.stake.fixed} className="text-base" />
                    ),
                },
                ...(rules.cap ? [{ k: "Most you can stake", v: <CoinAmount value={rules.cap} className="text-base" /> }] : []),
                { k: "Pool", v: <span className="text-sm font-semibold first-letter:uppercase">{pool}</span> },
              ].map((r) => (
                <CardRow key={r.k} className="py-3">
                  <dt className="flex-1 text-sm text-muted-foreground">{r.k}</dt>
                  <dd>{r.v}</dd>
                </CardRow>
              ))}
            </dl>
          </Card>

          <div className="flex gap-2">
            <Button variant="secondary" size="lg" onClick={() => setState("declined")}>
              Decline
            </Button>
            {short > 0 ? (
              <Button size="lg" className="min-w-0 flex-1" disabled>
                Need {formatCoins(short)} more coins
              </Button>
            ) : (
              <Button size="lg" className="min-w-0 flex-1 justify-between ps-5 pe-4" onClick={() => setState("accepted")}>
                Accept
                <span className="flex items-center gap-1 font-display text-base font-bold">
                  {formatCoins(entry)}
                  <Coin className="size-4 text-[8px]" />
                  <span className="sr-only">coins entry</span>
                </span>
              </Button>
            )}
          </div>
          {short > 0 && (
            <p className="text-center text-xs text-muted-foreground">
              <Link href="/wallet" className="font-semibold text-foreground underline underline-offset-3">
                Ways to earn
              </Link>
            </p>
          )}
        </motion.div>
      )}

      {state === "accepted" && (
        <motion.div key="accepted" {...fade} className="flex flex-col gap-[18px]">
          <p aria-live="polite" className="flex items-center gap-2.5 rounded-xl border border-primary-line bg-primary-soft px-4 py-3 text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <motion.path
                d="M5 12.5l4.5 4.5L19 7"
                stroke="var(--primary)"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
              />
            </svg>
            <span>
              <span className="font-semibold">You&apos;re in {league}.</span> Now set your predictions.
            </span>
          </p>
          {children}
        </motion.div>
      )}

      {state === "declined" && (
        <motion.div key="declined" {...fade} aria-live="polite" className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3">
          <p className="flex-1 text-sm text-muted-foreground">Declined {from.name}&apos;s invite</p>
          <Button variant="ghost" size="sm" className="h-9" onClick={() => setState("pending")}>
            Undo
          </Button>
          <Button asChild variant="secondary" size="sm" className="h-9">
            <Link href="/challenges">Challenges</Link>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
