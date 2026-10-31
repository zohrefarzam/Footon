"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Coin } from "./coin";
import { LiveDot } from "./live";

export type IslandLive = {
  minute: number;
  home: string;
  away: string;
  score: [number, number];
  /** e.g. "Q4" */
  questionLabel: string;
  question: string;
  /** e.g. "75'", shown while an answer waits to resolve. */
  resolvesAt: string;
  href: string;
};

/**
 * The sticky top island, on every tab. One black pill that carries the live
 * match (minute, score, open question) and the wallet. Tap the match side to
 * expand and answer in place; tap the coins to open your profile. Collapses on
 * scroll, outside tap or Escape. Without a live match it's just the wallet.
 */
export function LiveIsland({ coins, live }: { coins: number; live?: IslandLive }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 34 };

  // collapse on scroll, outside tap and Escape: the island must never cover the page for long
  useEffect(() => {
    if (!open) return;
    const startY = window.scrollY;
    const onScroll = () => Math.abs(window.scrollY - startY) > 24 && setOpen(false);
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const wallet = (
    <Link
      href="/me"
      aria-label={`${coins.toLocaleString("en-US")} coins. Open profile`}
      className="flex h-11 shrink-0 items-center gap-1.5 rounded-full ps-2 pe-3.5 outline-none transition-[transform,background-color] duration-200 ease-spring hover:bg-white/5 active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60"
    >
      <Coin className="size-[22px]" />
      <span className="font-display text-lg font-bold tabular-nums">{coins.toLocaleString("en-US")}</span>
    </Link>
  );

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{ borderRadius: open ? 26 : 23 }}
      transition={spring}
      className="pointer-events-auto overflow-hidden border border-[#26262c] bg-black shadow-[0_12px_32px_-12px_rgb(0_0_0/0.95)]"
    >
      <div className="flex items-center ps-1">
        {live ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="island-question"
            aria-label={`Live: ${live.home} ${live.score[0]}, ${live.away} ${live.score[1]}, ${live.minute} minutes. ${open ? "Hide" : "Show"} question ${live.questionLabel}`}
            className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full ps-3 pe-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
          >
            <LiveDot />
            <span className="font-display text-base font-bold text-live tabular-nums">{live.minute}&apos;</span>
            <span className="min-w-0 truncate text-start font-display text-[17px] font-bold tracking-wide">
              {live.home} <span className="tabular-nums">{live.score[0]}–{live.score[1]}</span> {live.away}
            </span>
            <span className="ms-auto flex shrink-0 items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                {open ? (
                  <motion.span
                    key="close"
                    initial={{ opacity: 0, rotate: 180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex size-7 items-center justify-center rounded-full bg-surface-3 text-muted-foreground"
                  >
                    <ChevronUp className="size-4" strokeWidth={2.4} />
                  </motion.span>
                ) : answer ? (
                  <motion.span
                    key="answered"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-7 items-center rounded-full border border-primary-line bg-primary-soft px-2.5 text-xs font-semibold text-primary"
                  >
                    {live.questionLabel} · {answer === "yes" ? "Yes" : "No"}
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-7 items-center rounded-full bg-primary px-2.5 text-xs font-bold text-primary-foreground"
                  >
                    {live.questionLabel}
                    <span className="max-[360px]:hidden">&nbsp;open</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        ) : (
          <span className="flex-1" />
        )}
        {live && <span aria-hidden="true" className="h-5 w-px shrink-0 bg-[#2a2a30]" />}
        {wallet}
      </div>

      <AnimatePresence initial={false}>
        {live && open && (
          <motion.div
            key="body"
            id="island-question"
            initial={{ height: 0, opacity: 0, filter: "blur(6px)" }}
            animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
            exit={{ height: 0, opacity: 0, filter: "blur(6px)" }}
            transition={{ height: spring, opacity: { duration: reduce ? 0 : 0.2 }, filter: { duration: reduce ? 0 : 0.25 } }}
          >
            <div className="flex flex-col gap-3 px-4 pt-1 pb-3.5">
              <p className="text-[19px] leading-tight font-bold tracking-[-0.02em] text-balance">{live.question}</p>

              <AnimatePresence mode="wait" initial={false}>
                {!answer ? (
                  <motion.div key="ask" exit={{ opacity: 0, y: 4 }} className="grid grid-cols-2 gap-2">
                    {(["yes", "no"] as const).map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAnswer(a)}
                        className={cn(
                          "flex h-11 items-center justify-center rounded-md text-[15px] font-bold outline-none transition-[transform,filter] duration-200 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60",
                          a === "yes"
                            ? "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.45)] hover:brightness-105"
                            : "border border-line-strong bg-surface-3",
                        )}
                      >
                        {a === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="locked"
                    initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    className="flex h-11 items-center gap-2 rounded-md bg-surface-2 px-3"
                    aria-live="polite"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <motion.path
                        d="M5 12.5l4.5 4.5L19 7"
                        stroke="var(--primary)"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.45, delay: 0.1, ease: [0.65, 0, 0.35, 1] }}
                      />
                    </svg>
                    <span className="text-sm font-semibold">You said {answer === "yes" ? "Yes" : "No"}</span>
                    <span className="text-shimmer ms-auto text-[13px] font-medium">Waiting for {live.resolvesAt}…</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                href={live.href}
                onClick={() => setOpen(false)}
                className="group flex h-9 items-center justify-between rounded-sm text-[13px] font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
              >
                Open match and chat
                <ArrowRight className="size-4 transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180" strokeWidth={2.2} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
