"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const PITCH = 16; // one link + one joint
const LINK = 10; // link length
const WRAP = 5; // bend radius where the chain turns round the card edge
const DROP = 30; // how far it runs down the side before it's gone

/** A minimal chain along `d`: hollow capsule links (round caps) with thin joints between. */
function ChainPath({ d }: { d: string }) {
  const gap = PITCH - LINK;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke="#4a4a52" strokeWidth={5} strokeDasharray={`${LINK - 5} ${gap + 5}`} />
      <path d={d} stroke="var(--surface)" strokeWidth={1.75} strokeDasharray={`${LINK - 5} ${gap + 5}`} />
      <path d={d} stroke="#4a4a52" strokeWidth={1.75} strokeDasharray={`${gap + 2} ${LINK - 2}`} strokeDashoffset={-(LINK - 3.5)} />
    </g>
  );
}

/**
 * Locked Fantasy, on Home. A thin chain is wrapped round the card: straight
 * across the front, bending round both side edges and running down out of
 * sight, with a small padlock on it. A stepped lime bar shows predictions made.
 * At full, the chain falls away and the padlock opens lime. Links to Team.
 */
export function FantasyUnlock({ done, total, href = "/team" }: { done: number; total: number; href?: string }) {
  const reduce = useReducedMotion();
  const card = useRef<HTMLAnchorElement>(null);
  const strap = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; y: number } | null>(null);
  const d = Math.min(done, total);
  const left = total - d;
  const open = left === 0;

  useEffect(() => {
    const el = card.current;
    const s = strap.current;
    if (!el || !s) return;
    const ro = new ResizeObserver(() => setBox({ w: el.offsetWidth, y: s.offsetTop + s.offsetHeight / 2 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // front run, and the two ends turning round the side edges (masked to fade: they go behind)
  const paths = box && {
    front: `M1 ${box.y}H${box.w - 1}`,
    left: `M1 ${box.y}A${WRAP} ${WRAP} 0 0 0 ${1 - WRAP} ${box.y + WRAP}V${box.y + DROP}`,
    right: `M${box.w - 1} ${box.y}A${WRAP} ${WRAP} 0 0 1 ${box.w - 1 + WRAP} ${box.y + WRAP}V${box.y + DROP}`,
  };

  return (
    <Link
      ref={card}
      href={href}
      className={cn(
        "group relative flex flex-col rounded-[20px] border p-4 outline-none transition-colors duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/60",
        open ? "border-primary-line bg-primary-soft" : "border-line bg-surface hover:bg-[#141417]",
      )}
    >
      <AnimatePresence>
        {paths && box && !open && (
          <motion.svg
            key="chain"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <defs>
              <linearGradient id="fantasy-chain-fade" gradientUnits="userSpaceOnUse" x1="0" y1={box.y} x2="0" y2={box.y + DROP}>
                <stop offset="0" stopColor="#fff" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <mask id="fantasy-chain-behind" maskUnits="userSpaceOnUse" x={-40} y={box.y - 10} width={box.w + 80} height={DROP + 20}>
                <rect x={-40} y={box.y - 10} width={box.w + 80} height={DROP + 20} fill="url(#fantasy-chain-fade)" />
              </mask>
            </defs>
            <g mask="url(#fantasy-chain-behind)">
              <ChainPath d={paths.left} />
              <ChainPath d={paths.right} />
            </g>
            <ChainPath d={paths.front} />
          </motion.svg>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold">{open ? "Fantasy is open" : "Fantasy is locked"}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {open ? "Build your squad." : `${left} more ${left === 1 ? "prediction" : "predictions"} to unlock`}
          </p>
        </div>
        <ChevronRight
          className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180"
          aria-hidden="true"
        />
      </div>

      {/* the line the chain runs along, with the padlock on it */}
      <div ref={strap} className="relative my-3 flex h-7 items-center justify-center" aria-hidden="true">
        <svg viewBox="0 0 24 28" className="relative h-7 w-6">
          <motion.path
            d="M7 13V9a5 5 0 0 1 10 0v4"
            fill="none"
            stroke={open ? "var(--primary)" : "#52525b"}
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={false}
            animate={open ? { y: -3, rotate: 24 } : { y: 0, rotate: 0 }}
            style={{ transformBox: "fill-box", transformOrigin: "100% 100%" }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 16, delay: 0.2 }}
          />
          <rect
            x="3"
            y="12"
            width="18"
            height="15"
            rx="4.5"
            fill={open ? "var(--primary)" : "var(--surface-3)"}
            stroke={open ? "var(--primary)" : "#52525b"}
            strokeWidth="1.5"
          />
          <rect x="11" y="17" width="2" height="5" rx="1" fill={open ? "var(--primary-foreground)" : "var(--muted-foreground)"} />
        </svg>
      </div>

      {/* stepped linear progress */}
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label="Predictions toward Fantasy"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={d}
          aria-valuetext={`${d} of ${total}`}
          className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#27272a]"
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${(d / total) * 100}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20, delay: 0.15 }}
          />
          {Array.from({ length: total - 1 }, (_, i) => (
            <span
              key={i}
              className={cn("absolute inset-y-0 w-[3px] -translate-x-1/2", open ? "bg-[#1a1f0c]" : "bg-surface")}
              style={{ left: `${((i + 1) / total) * 100}%` }}
            />
          ))}
        </div>
        <p className="shrink-0 font-display text-base leading-none font-bold">
          <span className={cn(open && "text-primary")}>{d}</span>
          <span className="text-muted-foreground">/{total}</span>
        </p>
      </div>
    </Link>
  );
}
