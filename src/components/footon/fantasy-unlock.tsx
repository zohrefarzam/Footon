"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

const SHIRT = "M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z";

/**
 * Fantasy unlock progress, on Home: a preview of the squad you're earning.
 * One shirt per prediction needed, in an arc on a line-drawn half pitch
 * (neutral lines; pitch green is for the Team screen only). Made = lime shirt
 * with its number, popping in one after another; next = dashed soft-lime;
 * rest = dark with a lock. At full the card turns soft-lime and the centre
 * shirt gets the amber captain "C". Links to /fantasy.
 */
export function FantasyUnlock({ done, total, href = "/fantasy" }: { done: number; total: number; href?: string }) {
  const reduce = useReducedMotion();
  const d = Math.min(done, total);
  const left = total - d;
  const open = left === 0;
  const mid = (total - 1) / 2;

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[20px] border outline-none transition-colors duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/60",
        open ? "border-primary-line bg-primary-soft" : "border-line bg-surface hover:bg-[#141417]",
      )}
    >
      <div
        role="progressbar"
        aria-label="Predictions toward Fantasy"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={d}
        aria-valuetext={`${d} of ${total} squad spots earned`}
        className="relative h-[108px] overflow-hidden bg-[radial-gradient(circle,#1c1c21_1px,transparent_1.5px)] bg-[size:14px_14px]"
      >
        {/* half pitch: box at the top, halfway line + centre arc at the bottom */}
        <svg aria-hidden="true" viewBox="0 0 350 108" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <g fill="none" stroke="var(--line-strong)" strokeWidth="1.5" vectorEffect="non-scaling-stroke">
            <path d="M110 0v26h130V0" vectorEffect="non-scaling-stroke" />
            <path d="M0 107h350" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
        <span aria-hidden="true" className="absolute -bottom-10 left-1/2 size-20 -translate-x-1/2 rounded-full border-[1.5px] border-line-strong" />

        {Array.from({ length: total }, (_, i) => {
          const filled = i < d;
          const next = i === d;
          const captain = open && i === Math.round(mid);
          // arc: the middle shirt sits highest, like a front line
          const x = total === 1 ? 50 : 13 + (i * 74) / (total - 1);
          const y = 34 + Math.abs(i - mid) * (36 / Math.max(mid, 1));
          return (
            <motion.span
              key={i}
              aria-hidden="true"
              className="absolute -translate-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={reduce || !filled ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 22, delay: 0.15 + i * 0.12 }}
            >
              <span
                className="relative block size-11 transition-transform duration-200 ease-spring group-hover:-translate-y-1"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                <svg width="44" height="44" viewBox="0 0 24 24" className="absolute inset-0">
                  <path
                    d={SHIRT}
                    fill={filled ? "var(--primary)" : next ? "var(--primary-soft)" : "#1c1c21"}
                    stroke={filled ? "var(--primary)" : next ? "var(--primary)" : "var(--line-strong)"}
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                    strokeDasharray={next ? "2 1.6" : undefined}
                  />
                </svg>
                <span className="absolute inset-x-0 top-[13px] flex justify-center">
                  {filled ? (
                    <span className="font-display text-base leading-none font-bold text-primary-foreground">{i + 1}</span>
                  ) : next ? (
                    <span className="font-display text-base leading-none font-bold text-primary">{i + 1}</span>
                  ) : (
                    <Lock className="mt-px size-3.5 text-muted-foreground" strokeWidth={2.2} />
                  )}
                </span>
                {captain && (
                  <span className="absolute -top-1 -right-1.5 flex size-[18px] items-center justify-center rounded-full border-2 border-surface bg-live text-[11px] font-extrabold text-live-foreground">
                    C
                  </span>
                )}
              </span>
            </motion.span>
          );
        })}
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-line p-4">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold">{open ? "Fantasy is open" : "Fantasy unlocks soon"}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {open ? "Your squad is ready. Pick a captain." : `${left} more ${left === 1 ? "prediction" : "predictions"} to build your squad`}
          </p>
        </div>
        <p className="flex shrink-0 items-baseline font-display leading-none font-bold">
          <span className={cn("text-[28px]", d > 0 && "text-primary")}>{d}</span>
          <span className="text-base text-muted-foreground">/{total}</span>
          <ChevronRight
            className="ms-1.5 size-4 self-center text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180"
            aria-hidden="true"
          />
        </p>
      </div>
    </Link>
  );
}
