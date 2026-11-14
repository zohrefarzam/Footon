"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Coin } from "./coin";
import type { InviteWithMatch } from "./invite-strip";
import { TeamCrest } from "./team-crest";
import { formatNumber, matchup } from "@/lib/format";

type State = "pending" | "joined" | "declined";

/**
 * One invite as a row in the /invites list (inside a divided Card). Join /
 * Decline resolve in place: joining confirms with a drawn check, declining
 * leaves an Undo instead of vanishing. Buttons match the Home InviteStrip.
 */
export function InviteRow({ invite }: { invite: InviteWithMatch }) {
  const [state, setState] = useState<State>("pending");
  const reduce = useReducedMotion();
  const m = invite.match;
  const fade = {
    initial: reduce ? false : { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: reduce ? 0 : 0.2 },
  } as const;

  return (
    <li aria-live="polite" className="px-4 py-3.5">
      <AnimatePresence mode="wait" initial={false}>
        {state === "pending" && (
          <motion.div key="pending" {...fade} className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Avatar>
                <AvatarFallback>{invite.initial}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold">{invite.league}</p>
                <p className="truncate text-xs text-muted-foreground">{invite.from} دعوتت کرد</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-9"
                aria-label={`رد دعوت ${invite.from}`}
                onClick={() => setState("declined")}
              >
                <X />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-9 rounded-sm px-3.5"
                aria-label={`پیوستن به ${invite.league}`}
                onClick={() => setState("joined")}
              >
                بپیوند
              </Button>
            </div>

            <div className="flex items-center gap-2 text-[13px]">
              {/* home first (right in RTL) and on top; away tucks in behind it */}
              <TeamCrest code={m.home.code} colors={m.home.colors} size="xs" className="relative z-10 size-[30px]" />
              <TeamCrest code={m.away.code} colors={m.away.colors} size="xs" className="-ms-2.5 size-[30px] opacity-90" />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {matchup(m.home.name, m.away.name)}
              </span>
              <span className="shrink-0 font-display text-sm font-bold text-muted-foreground">
                {m.day ?? "امروز"} <span className="text-foreground">{m.kickoff}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <AvatarGroup className="[&>[data-slot=avatar]]:ring-surface">
                {invite.members.slice(0, 3).map((x, i) => (
                  <Avatar key={i} className="size-6">
                    <AvatarFallback className="text-[11px]">{x}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <span className="text-xs whitespace-nowrap text-muted-foreground">{formatNumber(invite.members.length)} نفر</span>
              <span className="ms-1 flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground">
                <Coin className="size-[18px]" />
                ورودی <span className="font-display text-sm font-bold text-foreground">{formatNumber(invite.entry)}</span>
              </span>
            </div>
          </motion.div>
        )}

        {state === "joined" && (
          <motion.div key="joined" {...fade} className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <motion.path
                  d="M5 12.5l4.5 4.5L19 7"
                  stroke="var(--primary)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: reduce ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, delay: 0.1, ease: [0.65, 0, 0.35, 1] }}
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">عضو {invite.league} شدی</p>
              <p className="text-xs text-muted-foreground">پیش‌بینی‌هایت را قبل از {m.kickoff} ثبت کن</p>
            </div>
            <Button asChild variant="soft" size="sm" className="h-9 rounded-sm px-3">
              <Link href={`/challenges/${invite.id}`}>
                باز کن
                <ChevronRight className="rtl:rotate-180" />
              </Link>
            </Button>
          </motion.div>
        )}

        {state === "declined" && (
          <motion.div key="declined" {...fade} className="flex items-center gap-2.5">
            <p className="flex-1 text-[13px] text-muted-foreground">دعوت {invite.from} را رد کردی</p>
            <Button variant="ghost" size="sm" className="h-9" onClick={() => setState("pending")}>
              برگردان
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
