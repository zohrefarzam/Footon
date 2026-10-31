"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronRight, Lock, LockOpen } from "lucide-react";

import { cn } from "@/lib/utils";

const INSET = 6; // chain centre line, from the card edge
const RADIUS = 20; // card radius
const PITCH = 27; // one face link + one edge link

/** Rounded-rect path for the chain to follow, and its length. */
function track(w: number, h: number) {
  const [x0, y0, x1, y1] = [INSET, INSET, w - INSET, h - INSET];
  const r = RADIUS - INSET;
  const d = `M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y1 - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
  const len = 2 * (x1 - x0 - 2 * r) + 2 * (y1 - y0 - 2 * r) + 2 * Math.PI * r;
  return { d, len };
}

/**
 * Locked Fantasy, on Home. The card is wrapped in a chain with a padlock hung
 * on it; a stepped lime bar inside shows predictions made. At full, the chain
 * drops away and the padlock opens lime. Links to the Team tab.
 */
export function FantasyUnlock({ done, total, href = "/team" }: { done: number; total: number; href?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const d = Math.min(done, total);
  const left = total - d;
  const open = left === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A whole number of links around the card, so the seam doesn't show.
  const chain = size && size.w > 0 ? track(size.w, size.h) : null;
  const unit = chain ? chain.len / Math.max(8, Math.round(chain.len / PITCH)) : PITCH;
  const face = unit * 0.62; // capsule length incl. round caps
  const cap = 4.5; // half the face stroke: round caps add this at each end

  return (
    <Link
      ref={ref}
      href={href}
      className={cn(
        "group relative flex flex-col rounded-[20px] border p-5 outline-none transition-colors duration-300 hover:bg-[#141417] focus-visible:ring-[3px] focus-visible:ring-ring/60",
        open ? "border-primary-line bg-primary-soft" : "border-transparent",
      )}
    >
      {/* the chain: hollow capsule links joined by edge links, all along the card edge */}
      <AnimatePresence>
        {chain && !open && (
          <motion.svg
            key="chain"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
            viewBox={`0 0 ${size!.w} ${size!.h}`}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <g fill="none" strokeLinecap="round">
              <path d={chain.d} stroke="#3f3f46" strokeWidth={cap * 2} strokeDasharray={`${face - cap * 2} ${unit - face + cap * 2}`} />
              <path d={chain.d} stroke="var(--background)" strokeWidth={3} strokeDasharray={`${face - cap * 2} ${unit - face + cap * 2}`} />
              <path
                d={chain.d}
                stroke="#5b5b64"
                strokeWidth={3.5}
                strokeDasharray={`${unit - face + 6} ${face - 6}`}
                strokeDashoffset={-(face - cap - 3)}
              />
            </g>
          </motion.svg>
        )}
      </AnimatePresence>

      {/* padlock hung on the chain */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{ rotate: open ? 0 : -8 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 18 }}
        className={cn(
          "absolute -top-4 end-7 flex size-10 items-center justify-center rounded-[12px] border-2 shadow-[0_8px_16px_-8px_rgb(0_0_0/0.9)]",
          open ? "border-primary bg-primary text-primary-foreground" : "border-[#52525b] bg-surface-3 text-muted-foreground",
        )}
      >
        {open ? <LockOpen className="size-[18px]" strokeWidth={2.4} /> : <Lock className="size-[18px]" strokeWidth={2.4} />}
      </motion.span>

      <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">
        {open ? "FANTASY · UNLOCKED" : "FANTASY · LOCKED"}
      </p>
      <p className="mt-1 pe-12 text-[17px] font-bold tracking-[-0.02em]">{open ? "Unchained. Build your squad." : "Break the chain"}</p>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        {open ? "Fantasy is open for you." : `${left} more ${left === 1 ? "prediction" : "predictions"} to unlock your squad`}
      </p>

      {/* stepped linear progress */}
      <div className="mt-4 flex items-center gap-3">
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
              className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-background"
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
