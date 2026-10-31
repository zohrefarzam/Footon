"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * Chain geometry (SVG units). One face link per prediction needed, joined by
 * edge links, ending in a padlock. Face i spans [i*S, i*S + FW].
 */
const S = 48; // pitch between face links
const FW = 40; // face link width
const CY = 24; // chain centre line
const LOCKED = "#3f3f46";
const LOCKED_EDGE = "#52525b";

/**
 * Fantasy is chained shut until you make enough predictions. Each prediction
 * breaks one link (lime, pops free); the rest stay grey and lead into a padlock.
 * A stepped linear bar underneath carries the same progress. At full, the
 * shackle springs open. Links to the Team tab.
 */
export function FantasyUnlock({ done, total, href = "/team" }: { done: number; total: number; href?: string }) {
  const reduce = useReducedMotion();
  const d = Math.min(done, total);
  const left = total - d;
  const open = left === 0;
  const px = total * S + 4; // padlock x
  const width = px + 28;
  const spring = (delay = 0) => (reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 22, delay });

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-dashed border-line-strong p-4 outline-none transition-colors hover:bg-[#141417] focus-visible:ring-[3px] focus-visible:ring-ring/60"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">FANTASY</p>
          <p className="mt-1 text-[17px] font-bold tracking-[-0.02em]">{open ? "Unchained. Build your squad." : "Break the chain"}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {open ? "Fantasy is open for you." : `${left} more ${left === 1 ? "prediction" : "predictions"} to unlock your squad`}
          </p>
        </div>
        <p className="flex items-center font-display text-[22px] leading-none font-bold">
          <span className={cn(open && "text-primary")}>{d}</span>
          <span className="text-base text-muted-foreground">/{total}</span>
          <ChevronRight
            className="ms-1 size-4 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180"
            aria-hidden="true"
          />
        </p>
      </div>

      {/* the chain */}
      <svg viewBox={`-12 0 ${width + 12} 44`} className="mt-4 h-11 w-full" preserveAspectRatio="xMinYMid meet" aria-hidden="true">
        {/* broken links: lime, popped loose, each joined to the next */}
        <motion.g initial={reduce ? false : { x: 0 }} animate={{ x: d && !open ? -6 : 0 }} transition={spring(0.15 + d * 0.08)}>
          {Array.from({ length: d }, (_, i) => (
            <motion.rect
              key={`d${i}`}
              x={i * S}
              y={CY - 10}
              width={FW}
              height={20}
              rx={10}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={4}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              initial={reduce ? false : { scale: 0.5, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: i % 2 ? 4 : -4 }}
              transition={spring(0.08 * i)}
            />
          ))}
          {Array.from({ length: Math.max(0, d - 1) }, (_, i) => (
            <rect
              key={`de${i}`}
              x={i * S + FW - 10}
              y={CY - 3}
              width={S - FW + 20}
              height={6}
              rx={3}
              fill="var(--primary)"
              stroke="var(--background)"
              strokeWidth={2}
            />
          ))}
        </motion.g>

        {/* locked links */}
        {Array.from({ length: left }, (_, k) => {
          const i = d + k;
          return <rect key={`l${i}`} x={i * S} y={CY - 10} width={FW} height={20} rx={10} fill="none" stroke={LOCKED} strokeWidth={4} />;
        })}

        {/* edge links between locked faces, and into the padlock */}
        {Array.from({ length: total }, (_, i) => {
          if (i < d) return null; // broken off
          const x = i * S + FW - 10;
          const w = i === total - 1 ? px - x + 10 : S - FW + 20;
          return (
            <rect
              key={`e${i}`}
              x={x}
              y={CY - 3}
              width={w}
              height={6}
              rx={3}
              fill={LOCKED_EDGE}
              stroke="var(--background)"
              strokeWidth={2}
            />
          );
        })}

        {/* padlock */}
        <motion.path
          d={`M${px + 6} ${CY - 4} v-7 a7 7 0 0 1 14 0 v7`}
          fill="none"
          stroke={open ? "var(--primary)" : LOCKED_EDGE}
          strokeWidth={3.5}
          strokeLinecap="round"
          initial={false}
          animate={open ? { y: -6, rotate: 28 } : { y: 0, rotate: 0 }}
          style={{ transformBox: "fill-box", transformOrigin: "100% 100%" }}
          transition={spring(0.3)}
        />
        <rect
          x={px}
          y={CY - 5}
          width={26}
          height={21}
          rx={6}
          fill={open ? "var(--primary)" : "var(--surface-3)"}
          stroke={open ? "var(--primary)" : LOCKED_EDGE}
          strokeWidth={2}
        />
        <circle cx={px + 13} cy={CY + 3} r={2.5} fill={open ? "var(--primary-foreground)" : "var(--muted-foreground)"} />
        <rect x={px + 12} y={CY + 4} width={2} height={6} rx={1} fill={open ? "var(--primary-foreground)" : "var(--muted-foreground)"} />
      </svg>

      {/* stepped linear progress */}
      <div
        role="progressbar"
        aria-label="Predictions toward Fantasy"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={d}
        aria-valuetext={`${d} of ${total}`}
        className="relative mt-3 h-2 overflow-hidden rounded-full bg-[#27272a]"
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${(d / total) * 100}%` }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
        />
        {/* step notches, one per prediction */}
        {Array.from({ length: total - 1 }, (_, i) => (
          <span
            key={i}
            className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-background"
            style={{ left: `${((i + 1) / total) * 100}%` }}
          />
        ))}
      </div>
    </Link>
  );
}
