"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

// 4-3-3, attacking up. [position, x%, y%]
const SPOTS = [
  ["LW", 20, 15], ["ST", 50, 11], ["RW", 80, 15],
  ["CM", 24, 38], ["CM", 50, 35], ["CM", 76, 38],
  ["LB", 13, 62], ["CB", 37, 65], ["CB", 63, 65], ["RB", 87, 62],
  ["GK", 50, 86],
] as const;
const CAPTAIN = 1;
const POS: Record<string, string> = { GK: "گلر", LB: "دفاع چپ", CB: "دفاع", RB: "دفاع راست", CM: "هافبک", LW: "وینگر چپ", ST: "مهاجم", RW: "وینگر راست" };

export function Pitch() {
  const [sel, setSel] = useState(CAPTAIN);

  return (
    <>
      <section
        aria-label="ترکیب، ۴-۳-۳"
        className="relative h-[400px] overflow-hidden rounded-2xl border border-[#1c2a1f] bg-[repeating-linear-gradient(180deg,var(--pitch)_0_50px,var(--pitch-2)_50px_100px)]"
      >
        <div aria-hidden="true" className="absolute inset-3.5 rounded-md border-[1.5px] border-pitch-line" />
        <div aria-hidden="true" className="absolute inset-x-3.5 top-1/2 border-t-[1.5px] border-pitch-line" />
        <div aria-hidden="true" className="absolute top-1/2 left-1/2 size-[84px] -translate-1/2 rounded-full border-[1.5px] border-pitch-line" />
        <div aria-hidden="true" className="absolute top-3.5 left-1/2 h-14 w-40 -translate-x-1/2 border-[1.5px] border-t-0 border-pitch-line" />
        <div aria-hidden="true" className="absolute bottom-3.5 left-1/2 h-14 w-40 -translate-x-1/2 border-[1.5px] border-b-0 border-pitch-line" />
        <span dir="ltr" className="absolute top-[22px] left-[22px] font-display text-[13px] font-bold text-white/35">4-3-3</span>

        {SPOTS.map(([pos, x, y], i) => {
          const on = i === sel;
          return (
            <button
              key={i}
              onClick={() => setSel(i)}
              aria-pressed={on}
              aria-label={`${POS[pos]}${i === CAPTAIN ? "، کاپیتان" : ""}`}
              className="absolute flex -translate-1/2 flex-col items-center gap-0.5 transition-transform duration-200 ease-spring hover:-translate-y-[calc(50%+3px)]"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className="relative block size-10">
                <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24">
                  <path
                    d="M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z"
                    fill={on ? "var(--primary)" : "var(--surface-2)"}
                    stroke={on ? "var(--primary)" : "rgb(255 255 255 / 0.35)"}
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
                {i === CAPTAIN && (
                  <span className="absolute -end-1.5 -top-1 flex size-[18px] items-center justify-center rounded-full border-2 border-pitch bg-live text-[10px] font-extrabold text-live-foreground">
                    ک
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "rounded-[6px] px-1.5 py-px font-display text-xs font-bold whitespace-nowrap",
                  on ? "bg-primary text-primary-foreground" : "bg-black/45 text-[#e1ebe5]",
                )}
              >
                {POS[pos]}
              </span>
            </button>
          );
        })}
      </section>
      <p className="sr-only" aria-live="polite">
        {POS[SPOTS[sel][0]]} انتخاب شد
      </p>
    </>
  );
}
