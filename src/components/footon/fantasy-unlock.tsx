"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const SHIRT = "M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z";

/**
 * Fantasy unlock progress as a compact Home tile: "Fantasy 3/5" over a row of
 * tiny shirts, one per prediction needed. Made = lime (pop in one after
 * another), next = dashed soft-lime, rest = dark. At full the tile turns
 * soft-lime. Links to /fantasy.
 */
export function FantasyUnlock({ done, total, href = "/fantasy", className }: { done: number; total: number; href?: string; className?: string }) {
  const reduce = useReducedMotion();
  const d = Math.min(done, total);
  const open = d === total;

  return (
    <Link
      href={href}
      aria-label={open ? "Fantasy is open" : `Fantasy: ${d} of ${total} predictions, ${total - d} more to unlock`}
      className={cn(
        "group flex min-w-0 flex-col justify-between gap-2 rounded-xl border px-3.5 py-3 outline-none transition-colors duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/60",
        open ? "border-primary-line bg-primary-soft" : "border-line bg-surface hover:bg-[#141417]",
        className,
      )}
    >
      <span className="flex items-center gap-1">
        <span className="text-[13px] font-semibold">{open ? "Fantasy open" : "Fantasy"}</span>
        <span className="ms-auto font-display text-base leading-none font-bold">
          <span className={cn(d > 0 && "text-primary")}>{d}</span>
          <span className="text-muted-foreground">/{total}</span>
        </span>
        <ChevronRight className="size-3.5 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
      </span>

      <span aria-hidden="true" className="flex gap-1">
        {Array.from({ length: total }, (_, i) => {
          const filled = i < d;
          const next = i === d;
          return (
            <motion.svg
              key={i}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              initial={reduce || !filled ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 22, delay: 0.15 + i * 0.1 }}
            >
              <path
                d={SHIRT}
                fill={filled ? "var(--primary)" : next ? "var(--primary-soft)" : "#1c1c21"}
                stroke={filled || next ? "var(--primary)" : "var(--line-strong)"}
                strokeWidth="1.4"
                strokeLinejoin="round"
                strokeDasharray={next ? "2 1.6" : undefined}
              />
            </motion.svg>
          );
        })}
      </span>
    </Link>
  );
}
