"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Answer = "yes" | "no";

export type LiveQuestion = {
  index: number;
  total: number;
  text: string;
  hint?: string;
  /** Seconds the question stays open. */
  seconds: number;
  /** Share of players who picked Yes (0–100), revealed after answering. */
  yesShare: number;
  resolvesAt: string;
};

/**
 * The live question, dealt on top of a stack (two cards peek behind it).
 * Before answering: Yes (lime) / No (secondary). After: crowd split bar, a drawn
 * check, and shimmering "Waiting for …" status.
 */
export function QuestionCard({
  question,
  onAnswer,
  className,
}: {
  question: LiveQuestion;
  onAnswer?: (a: Answer) => void;
  className?: string;
}) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [left, setLeft] = useState(question.seconds);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (answer) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [answer]);

  const pick = (a: Answer) => {
    setAnswer(a);
    onAnswer?.(a);
  };

  const r = 18;
  const c = 2 * Math.PI * r;

  return (
    <div className={cn("relative pt-3.5", className)}>
      <div aria-hidden="true" className="absolute inset-x-6 top-0 h-16 rounded-2xl border border-line bg-surface" />
      <div aria-hidden="true" className="absolute inset-x-3 top-[7px] h-16 rounded-2xl border border-[#232328] bg-[#141417]" />
      <motion.section
        initial={reduce ? false : { y: 24, rotate: -2, opacity: 0 }}
        animate={{ y: 0, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        aria-label={`Question ${question.index} of ${question.total}`}
        className="relative flex flex-col rounded-2xl border border-[#34343b] bg-surface-2 p-4 shadow-[0_24px_48px_-20px_rgb(0_0_0/0.9)]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">
            QUESTION {question.index} OF {question.total}
          </span>
          <span className="relative flex size-10 items-center justify-center" aria-label={`${left} seconds left`}>
            <svg width="40" height="40" viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden="true">
              <circle cx="20" cy="20" r={r} fill="none" stroke="#27272a" strokeWidth="3" />
              <circle
                cx="20"
                cy="20"
                r={r}
                fill="none"
                stroke="var(--live)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - left / question.seconds)}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
            <span aria-hidden="true" className="font-display text-sm font-bold text-live">
              {left}s
            </span>
          </span>
        </div>

        <h2 className="mt-1.5 text-[26px] leading-[1.15] font-bold tracking-[-0.03em] text-balance">{question.text}</h2>
        {question.hint && <p className="mt-1.5 text-[13px] text-muted-foreground">{question.hint}</p>}

        <AnimatePresence mode="wait" initial={false}>
          {!answer && left === 0 ? (
            <motion.p
              key="missed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex h-12 items-center justify-center rounded-md bg-surface-3 text-sm font-semibold text-muted-foreground"
              aria-live="polite"
            >
              Answers locked. You missed this one.
            </motion.p>
          ) : !answer ? (
            <motion.div
              key="ask"
              exit={{ opacity: 0, y: 6, filter: "blur(4px)" }}
              className="mt-4 grid grid-cols-2 gap-2"
            >
              <Button size="lg" className="h-12 text-base font-bold" onClick={() => pick("yes")}>
                Yes
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="h-12 text-base font-bold"
                onClick={() => pick("no")}
              >
                No
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="locked"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              className="mt-4 flex flex-col gap-2.5"
              aria-live="polite"
            >
              <div className="flex justify-between text-[13px] font-semibold">
                <span>Yes {question.yesShare}%</span>
                <span className="text-muted-foreground">{100 - question.yesShare}% No</span>
              </div>
              <div className="flex h-2 gap-[3px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${question.yesShare}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  className={cn("rounded-full", answer === "yes" ? "bg-primary" : "bg-[#52525b]")}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - question.yesShare}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  className={cn("rounded-full", answer === "no" ? "bg-primary" : "bg-[#3f3f46]")}
                />
              </div>
              <div className="mt-1 flex items-center gap-2">
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
                <span className="text-shimmer ml-auto text-[13px] font-medium">Waiting for {question.resolvesAt}…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}
