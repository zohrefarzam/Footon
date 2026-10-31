"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Answer = "yes" | "no";

/**
 * Calls you can make before kickoff, one row each with a Yes/No toggle
 * (soft-lime when picked; it's a selection, not the main action). The single
 * lime action is "Lock in" at the bottom. Calls already made arrive pre-filled.
 */
export function PrematchCalls({ questions, made }: { questions: { id: string; text: string }[]; made: number }) {
  const [answers, setAnswers] = useState<Record<string, Answer>>(() =>
    Object.fromEntries(questions.slice(0, made).map((q, i) => [q.id, i % 2 ? "no" : "yes"])),
  );
  const [locked, setLocked] = useState(made > 0);
  const count = Object.keys(answers).length;

  const pick = (id: string, a: Answer) => {
    setLocked(false);
    setAnswers((s) => ({ ...s, [id]: a }));
  };

  return (
    <section className="flex flex-col gap-2.5" aria-labelledby="calls-title">
      <h2 id="calls-title" className="flex items-center justify-between text-[13px] font-medium text-muted-foreground">
        Pre-match calls
        <span aria-live="polite">
          <span className="font-display text-[15px] font-bold text-foreground">{count}</span> of {questions.length} called
        </span>
      </h2>

      <Card className="overflow-hidden">
        {questions.map((q) => (
          <div key={q.id} className="flex items-center gap-3 px-4 py-3 [&+&]:border-t [&+&]:border-line">
            <p className="min-w-0 flex-1 text-[15px] font-semibold">{q.text}</p>
            <div className="flex shrink-0 gap-1.5" role="group" aria-label={q.text}>
              {(["yes", "no"] as const).map((a) => {
                const on = answers[q.id] === a;
                return (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(q.id, a)}
                    className={cn(
                      "h-9 w-[52px] rounded-sm border text-sm font-semibold outline-none transition-[transform,background-color,border-color,color] duration-200 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60",
                      on
                        ? "border-primary-line bg-primary-soft text-primary"
                        : "border-line-strong bg-surface-3 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {a === "yes" ? "Yes" : "No"}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      <AnimatePresence mode="wait" initial={false}>
        {locked ? (
          <motion.p
            key="locked"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-14 items-center justify-center gap-2 rounded-lg border border-primary-line bg-primary-soft text-[15px] font-semibold text-primary"
            aria-live="polite"
          >
            <Check className="size-[18px]" strokeWidth={2.6} />
            {count} {count === 1 ? "call" : "calls"} locked. See you at kickoff.
          </motion.p>
        ) : (
          <motion.div key="lock" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <Button size="lg" className="w-full font-bold" disabled={count === 0} onClick={() => setLocked(true)}>
              <Lock className="size-[18px]" strokeWidth={2.4} />
              {count ? `Lock in ${count} ${count === 1 ? "call" : "calls"}` : "Make a call to lock in"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
