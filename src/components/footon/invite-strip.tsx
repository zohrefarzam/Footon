"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Invite, Match } from "@/lib/mock-data";

export type InviteWithMatch = Invite & { match: Match };

/**
 * Every pending league invite in one swipeable row on Home. Each card: who,
 * which league and stake, the match and kickoff, who's in, Decline / Join.
 * Declined cards fold away; joined cards stay, marked soft-lime.
 */
export function InviteStrip({ invites }: { invites: InviteWithMatch[] }) {
  const [declined, setDeclined] = useState<string[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const reduce = useReducedMotion();
  const open = invites.filter((i) => !declined.includes(i.id));
  const pending = open.filter((i) => !joined.includes(i.id)).length;

  return (
    <AnimatePresence initial={false}>
      {open.length > 0 && (
        <motion.section
          key="invites"
          aria-labelledby="invites-title"
          exit={{ opacity: 0, height: 0, marginTop: -18 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-col gap-2.5"
        >
          <h2 id="invites-title" className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
            Invites
            {pending > 0 && (
              <span
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-3 px-1.5 font-display text-[13px] font-bold text-foreground"
                aria-label={`${pending} pending`}
              >
                {pending}
              </span>
            )}
          </h2>

          <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <AnimatePresence initial={false} mode="popLayout">
              {open.map((inv) => {
                const isIn = joined.includes(inv.id);
                const m = inv.match;
                return (
                  <motion.li
                    key={inv.id}
                    layout={!reduce}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className={
                      "flex w-[272px] shrink-0 snap-start flex-col gap-3 rounded-xl border p-3.5 transition-colors duration-300 " +
                      (isIn ? "border-primary-line bg-primary-soft" : "border-line bg-surface")
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-9">
                        <AvatarFallback className="text-[13px]">{inv.initial}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {inv.from} <span className="font-normal text-muted-foreground">invited you</span>
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {inv.league} · limit {inv.stakeLimit}
                        </p>
                      </div>
                      {!isIn && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="-me-1.5 -mt-1.5 self-start"
                          aria-label={`Decline ${inv.from}'s invite`}
                          onClick={() => setDeclined((d) => [...d, inv.id])}
                        >
                          <X />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-lg leading-none font-bold">
                          {m.home.code} <span className="text-muted-foreground">v</span> {m.away.code}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="font-display text-sm font-bold text-muted-foreground">
                            {m.day ?? "Today"} {m.kickoff}
                          </span>
                          <AvatarGroup aria-label={`${inv.members.length} in`}>
                            {inv.members.map((x, i) => (
                              <Avatar key={i} className="size-5 ring-surface">
                                <AvatarFallback className="text-[11px]">{x}</AvatarFallback>
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        </div>
                      </div>
                      <AnimatePresence mode="wait" initial={false}>
                        {isIn ? (
                          <motion.span
                            key="in"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex h-9 items-center gap-1.5 px-1 text-sm font-semibold text-primary"
                            aria-live="polite"
                          >
                            <Check className="size-4" strokeWidth={2.6} />
                            You&apos;re in
                          </motion.span>
                        ) : (
                          <motion.div key="join" exit={{ opacity: 0, scale: 0.8 }}>
                            <Button
                              variant="secondary"
                              className="h-9 rounded-sm px-4 text-sm"
                              onClick={() => setJoined((j) => [...j, inv.id])}
                              aria-label={`Join ${inv.league}`}
                            >
                              Join
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
