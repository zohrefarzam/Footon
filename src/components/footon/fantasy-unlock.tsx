"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const PITCH = 30; // one face link + one edge link
const CAP = 5.5; // half the face-link stroke (round caps add this at each end)
const OVERHANG = 24; // card padding (16) + 8px past the edge // chain runs past each card edge, as if wrapped round it
const CY = 14; // chain centre line inside its 28px-tall SVG

/** Straight chain from x=0 to x=w: hollow capsule links joined by edge links. */
function Chain({ w, tone }: { w: number; tone: "locked" | "open" }) {
  const unit = w / Math.max(4, Math.round(w / PITCH));
  const face = unit * 0.62;
  const d = `M0 ${CY}H${w}`;
  const faceDash = `${face - CAP * 2} ${unit - face + CAP * 2}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path
        d={d}
        stroke={tone === "open" ? "var(--primary)" : "#4a4a52"}
        strokeWidth={CAP * 2}
        strokeDasharray={faceDash}
        strokeDashoffset={-CAP}
      />
      <path d={d} stroke="var(--surface)" strokeWidth={3.5} strokeDasharray={faceDash} strokeDashoffset={-CAP} />
      <path
        d={d}
        stroke={tone === "open" ? "var(--primary)" : "#60606a"}
        strokeWidth={4}
        strokeDasharray={`${unit - face + 6} ${face - 6}`}
        strokeDashoffset={-(face - 3)}
      />
    </g>
  );
}

/**
 * Locked Fantasy, on Home. One chain runs across the card, wrapped over both
 * edges, with a padlock hanging in the middle; a stepped lime bar below shows
 * predictions made. At full, the chain snaps in two and falls away, and the
 * padlock opens lime. Links to the Team tab.
 */
export function FantasyUnlock({ done, total, href = "/team" }: { done: number; total: number; href?: string }) {
  const reduce = useReducedMotion();
  const row = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const d = Math.min(done, total);
  const left = total - d;
  const open = left === 0;

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.offsetWidth + OVERHANG * 2));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const half = w / 2;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col rounded-[20px] border p-4 outline-none transition-colors duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/60",
        open ? "border-primary-line bg-primary-soft" : "border-line bg-surface hover:bg-[#141417]",
      )}
    >
      <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">
        {open ? "FANTASY · UNLOCKED" : "FANTASY · LOCKED"}
      </p>
      <p className="mt-1 text-[17px] font-bold tracking-[-0.02em]">{open ? "Unchained. Build your squad." : "Break the chain"}</p>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        {open ? "Fantasy is open for you." : `${left} more ${left === 1 ? "prediction" : "predictions"} to unlock your squad`}
      </p>

      {/* the chain across the card, padlock hanging in the middle */}
      <div ref={row} className="relative my-3 h-14" aria-hidden="true">
        <AnimatePresence>
          {w > 0 && !open && (
            <motion.div key="chain" className="absolute top-1 -rotate-2" style={{ insetInline: -OVERHANG }} exit={{ opacity: 0 }}>
              {/* two halves, so it can snap at the lock */}
              {[0, 1].map((side) => (
                <motion.svg
                  key={side}
                  width={half}
                  height={28}
                  viewBox={`${side * half} 0 ${half} 28`}
                  className="absolute top-0 overflow-visible"
                  style={{ insetInlineStart: side * half, transformOrigin: side ? "100% 50%" : "0% 50%" }}
                  initial={reduce ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { y: 18, rotate: side ? -14 : 14, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <Chain w={w} tone="locked" />
                </motion.svg>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* padlock: shackle loops over the chain, body hangs below */}
        <motion.svg
          viewBox="0 0 36 48"
          className="absolute top-0 left-1/2 h-14 w-[42px] -translate-x-1/2"
          initial={reduce ? false : { rotate: 0 }}
          animate={{ rotate: open ? 0 : [0, 6, -4, 2, 0] }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.3, ease: "easeOut" }}
          style={{ transformOrigin: "50% 10%" }}
        >
          <motion.path
            d="M10 22V13a8 8 0 0 1 16 0v9"
            fill="none"
            stroke={open ? "var(--primary)" : "#71717a"}
            strokeWidth={4}
            strokeLinecap="round"
            initial={false}
            animate={open ? { y: -5, rotate: 26 } : { y: 0, rotate: 0 }}
            style={{ transformBox: "fill-box", transformOrigin: "100% 100%" }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 16, delay: 0.25 }}
          />
          <rect
            x="3"
            y="20"
            width="30"
            height="26"
            rx="8"
            fill={open ? "var(--primary)" : "var(--surface-3)"}
            stroke={open ? "var(--primary)" : "#52525b"}
            strokeWidth="2"
          />
          <circle cx="18" cy="31" r="3" fill={open ? "var(--primary-foreground)" : "var(--muted-foreground)"} />
          <rect x="16.75" y="32" width="2.5" height="7" rx="1.25" fill={open ? "var(--primary-foreground)" : "var(--muted-foreground)"} />
        </motion.svg>
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
          className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[#27272a]"
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
        <p className="flex shrink-0 items-center font-display text-[22px] leading-none font-bold">
          <span className={cn(open && "text-primary")}>{d}</span>
          <span className="text-base text-muted-foreground">/{total}</span>
          <ChevronRight
            className="ms-1.5 size-4 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180"
            aria-hidden="true"
          />
        </p>
      </div>
    </Link>
  );
}
