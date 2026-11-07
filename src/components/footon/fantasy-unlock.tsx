"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

const SHIRT = "M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z";

/**
 * Fantasy unlock progress as a compact Home tile. Locked reads as locked: the
 * dashed border (the system's "locked" card), a lock + "Fantasy locked", and
 * "N to go" beside a row of tiny shirts, one per prediction needed (made =
 * lime, popping in one after another; next = dashed soft-lime; rest = dark).
 * At full the tile turns soft-lime and solid. Links to /fantasy.
 */
export function FantasyUnlock({ done, total, href = "/fantasy", className }: { done: number; total: number; href?: string; className?: string }) {
  const reduce = useReducedMotion();
  const d = Math.min(done, total);
  const open = d === total;
  const left = total - d;

  return (
    <Link
      href={href}
      aria-label={open ? "Fantasy is open" : `Fantasy: ${d} of ${total} predictions, ${total - d} more to unlock`}
      className={cn(
        "group flex min-w-0 flex-col justify-between gap-2 rounded-xl border px-3.5 py-3 outline-none transition-colors duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/60",
        open ? "border-primary-line bg-primary-soft" : "border-dashed border-line-strong bg-surface hover:bg-surface-hover",
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        {!open && <Lock className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2.2} aria-hidden="true" />}
        <span className="truncate text-[13px] font-semibold">
          Fantasy{open ? " open" : <span className="max-[359px]:hidden"> locked</span>}
        </span>
        <span className="ms-auto font-display text-base leading-none font-bold">
          <span className={cn(d > 0 && "text-primary")}>{d}</span>
          <span className="text-muted-foreground">/{total}</span>
        </span>
        <ChevronRight className="size-3.5 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden="true" />
      </span>

      <span aria-hidden="true" className="flex items-center gap-1">
        {Array.from({ length: total }, (_, i) => {
          const filled = i < d;
          const next = i === d;
          return (
            <motion.svg
              key={i}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="shrink-0"
              initial={reduce || !filled ? false : { scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 22, delay: 0.15 + i * 0.1 }}
            >
              <path
                d={SHIRT}
                fill={filled ? "var(--primary)" : next ? "var(--primary-soft)" : "var(--surface-2)"}
                stroke={filled || next ? "var(--primary)" : "var(--line-strong)"}
                strokeWidth="1.4"
                strokeLinejoin="round"
                strokeDasharray={next ? "2 1.6" : undefined}
              />
            </motion.svg>
          );
        })}
        <span className="ms-auto ps-1 text-xs whitespace-nowrap text-muted-foreground max-[359px]:hidden">{open ? "Build squad" : `${left} to go`}</span>
      </span>
    </Link>
  );
}
