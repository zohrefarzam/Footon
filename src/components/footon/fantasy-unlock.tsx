"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Fantasy unlock progress, on Home. One segment per prediction needed: made
 * ones fill lime one after another, the next one is outlined soft-lime, the
 * rest stay dark. At full the card turns soft-lime. Links to the Team tab.
 */
export function FantasyUnlock({ done, total, href = "/team" }: { done: number; total: number; href?: string }) {
  const reduce = useReducedMotion();
  const d = Math.min(done, total);
  const left = total - d;
  const open = left === 0;

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-3.5 rounded-[20px] border p-4 outline-none transition-colors duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/60",
        open ? "border-primary-line bg-primary-soft" : "border-line bg-surface hover:bg-[#141417]",
      )}
    >
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold">{open ? "Fantasy is open" : "Fantasy unlocks soon"}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {open ? "Build your squad." : `${left} more ${left === 1 ? "prediction" : "predictions"} to build your squad`}
          </p>
        </div>
        <p className="flex shrink-0 items-baseline font-display leading-none font-bold">
          <span className={cn("text-[28px]", (open || d > 0) && "text-primary")}>{d}</span>
          <span className="text-base text-muted-foreground">/{total}</span>
          <ChevronRight
            className="ms-1.5 size-4 self-center text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180"
            aria-hidden="true"
          />
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="Predictions toward Fantasy"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={d}
        aria-valuetext={`${d} of ${total}`}
        className="flex gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => {
          const filled = i < d;
          const next = i === d;
          return (
            <span
              key={i}
              className={cn(
                "relative h-3 flex-1 overflow-hidden rounded-full",
                next ? "border border-primary-line bg-primary-soft" : "bg-[#27272a]",
              )}
            >
              {filled && (
                <motion.span
                  className="absolute inset-0 origin-left rounded-full bg-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] rtl:origin-right"
                  initial={reduce ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26, delay: 0.1 + i * 0.12 }}
                />
              )}
            </span>
          );
        })}
      </div>
    </Link>
  );
}
