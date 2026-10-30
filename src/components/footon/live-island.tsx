"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { LiveDot } from "./live";

type Props = {
  minute: number;
  home: string;
  away: string;
  score: [number, number];
  questionLabel: string;
  question: string;
  href: string;
};

/**
 * "Dynamic island" live activity. Collapsed: minute + score + open question.
 * Tap to expand into a quick answer. One per screen, top centre, only while a
 * match the user is in is live.
 */
export function LiveIsland({ minute, home, away, score, questionLabel, question, href }: Props) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  // Animate real width/height/radius, not `layout` scale transforms: FLIP
  // scaling squashed the contents and stretched the pill radius into an oval.
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 34 };

  return (
    <div className="flex justify-center">
      <motion.div
        initial={false}
        animate={{ width: open ? "100%" : 260, borderRadius: open ? 26 : 21 }}
        transition={spring}
        className="max-w-full overflow-hidden border border-[#26262c] bg-black shadow-[0_10px_30px_-10px_rgb(0_0_0/0.9)]"
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`Live: ${home} ${score[0]}, ${away} ${score[1]}, ${minute} minutes. ${open ? "Hide" : "Show"} open question`}
          className="flex h-10 w-full items-center gap-2.5 pr-1.5 pl-3.5"
        >
          <LiveDot />
          <span className="font-display text-base font-bold text-live">{minute}&apos;</span>
          <span className="flex-1 text-left font-display text-[17px] font-bold tracking-wide">
            {home} {score[0]}–{score[1]} {away}
          </span>
          <span className="flex h-7 items-center rounded-full bg-primary px-2.5 text-xs font-bold text-primary-foreground">
            {questionLabel}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0, filter: "blur(6px)" }}
              animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
              exit={{ height: 0, opacity: 0, filter: "blur(6px)" }}
              transition={{ height: spring, opacity: { duration: reduce ? 0 : 0.2 }, filter: { duration: reduce ? 0 : 0.25 } }}
            >
              {/* Fixed min width so the body doesn't reflow while the island shrinks. */}
              <div className="flex min-w-[258px] flex-col gap-2.5 px-3.5 pt-1.5 pb-3.5">
                <p className="text-[17px] font-semibold">{question}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href={href}
                    className="flex h-10 items-center justify-center rounded-[12px] bg-primary text-sm font-semibold text-primary-foreground transition-transform duration-200 ease-spring active:scale-95"
                  >
                    Yes
                  </Link>
                  <Link
                    href={href}
                    className="flex h-10 items-center justify-center rounded-[12px] bg-surface-3 text-sm font-semibold transition-transform duration-200 ease-spring active:scale-95"
                  >
                    No
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
