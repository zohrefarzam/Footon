"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/*
 * Empty-state pictures in Winky's sticker style: flat colours, an ink outline,
 * no gradients. Colours are art data (like a kit), not UI tokens.
 */
const INK = "#04170E";
const GRASS = "#43B883";
const AMBER = "#FFA83E";
const PAPER = "#E6F0EA";
const NET = "#183327";

/** Rotate / scale around a point in the picture, not the element's own box. */
const around = (x: number, y: number) =>
  ({ transformBox: "view-box", transformOrigin: `${x}px ${y}px` }) as const;
/** Each picture plays once when it appears (a tab switch remounts it); reduced motion shows the finished frame. */
const from = <T,>(reduce: boolean | null, v: T) => (reduce ? false : v);

function Ball({ x, y, r }: { x: number; y: number; r: number }) {
  const p = Array.from({ length: 5 }, (_, i) => {
    const a = (-90 + 72 * i) * (Math.PI / 180);
    return `${(x + r * 0.42 * Math.cos(a)).toFixed(1)},${(y + r * 0.42 * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <g
      stroke={INK}
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <circle cx={x} cy={y} r={r} fill="#fff" />
      <polygon points={p} fill={INK} />
      {[-90, -18, 54, 126, 198].map((d) => {
        const a = d * (Math.PI / 180);
        return (
          <line
            key={d}
            x1={x + r * 0.42 * Math.cos(a)}
            y1={y + r * 0.42 * Math.sin(a)}
            x2={x + r * 0.86 * Math.cos(a)}
            y2={y + r * 0.86 * Math.sin(a)}
            strokeWidth="2.5"
          />
        );
      })}
    </g>
  );
}

/** A ball about to hit the back of the net: you're not in a league yet. */
function Goal({ reduce }: { reduce: boolean | null }) {
  return (
    <>
      <motion.g
        style={around(80, 60)}
        initial={from(reduce, { scaleX: 1 })}
        animate={{ scaleX: [1, 1.05, 0.99, 1] }}
        transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
      >
        <rect x="36" y="34" width="88" height="54" fill={NET} />
        <g stroke="#F3F8F4" strokeOpacity=".4" strokeWidth="1.5">
          {[51, 66, 80, 95, 109].map((x) => (
            <line key={x} x1={x} y1="36" x2={x} y2="88" />
          ))}
          {[48, 62, 76].map((y) => (
            <line key={y} x1="38" y1={y} x2="122" y2={y} />
          ))}
        </g>
      </motion.g>
      <path
        d="M36 90V34H124V90"
        fill="none"
        stroke={INK}
        strokeWidth="11"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M36 90V34H124V90"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <rect
        x="10"
        y="88"
        width="140"
        height="10"
        rx="5"
        fill={GRASS}
        stroke={INK}
        strokeWidth="3"
      />
      <motion.g
        stroke={AMBER}
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={from(reduce, { opacity: 0 })}
        animate={{ opacity: [0, 1, 0, 1] }}
        transition={{ duration: 0.9, times: [0, 0.2, 0.7, 1] }}
      >
        <line x1="40" y1="72" x2="64" y2="72" />
        <line x1="46" y1="82" x2="68" y2="82" />
      </motion.g>
      <motion.g
        style={around(92, 78)}
        initial={from(reduce, { x: -90, rotate: -420 })}
        animate={{ x: 0, rotate: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.3, 1] }}
      >
        <Ball x={92} y={78} r={15} />
      </motion.g>
    </>
  );
}

/** An envelope sealed with a ball, a ticket peeking out: an invite on its way. */
function Invite({ reduce }: { reduce: boolean | null }) {
  return (
    <>
      <motion.g
        initial={from(reduce, { y: 30, opacity: 0 })}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 18,
          delay: 0.35,
        }}
      >
        <g transform="rotate(-7 80 40)">
          <rect
            x="46"
            y="14"
            width="68"
            height="40"
            rx="6"
            fill={AMBER}
            stroke={INK}
            strokeWidth="3"
          />
          <line
            x1="82"
            y1="20"
            x2="82"
            y2="48"
            stroke={INK}
            strokeWidth="2.5"
            strokeDasharray="3 4"
            strokeLinecap="round"
          />
          <circle cx="64" cy="34" r="5" fill={INK} />
        </g>
      </motion.g>
      <rect
        x="26"
        y="38"
        width="108"
        height="62"
        rx="9"
        fill={PAPER}
        stroke={INK}
        strokeWidth="3"
      />
      <path
        d="M28 42L80 78L132 42"
        fill={GRASS}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <motion.g
        style={around(80, 78)}
        initial={from(reduce, { scale: 0, rotate: -180 })}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 15, delay: 0.7 }}
      >
        <Ball x={80} y={78} r={13} />
      </motion.g>
    </>
  );
}

/** A stopwatch run all the way round: the whistle already went. */
function Time({ reduce }: { reduce: boolean | null }) {
  return (
    <>
      <rect
        x="70"
        y="12"
        width="20"
        height="10"
        rx="3"
        fill="#fff"
        stroke={INK}
        strokeWidth="3"
      />
      <rect
        x="76"
        y="20"
        width="8"
        height="8"
        fill="#fff"
        stroke={INK}
        strokeWidth="3"
      />
      <circle
        cx="80"
        cy="62"
        r="36"
        fill={PAPER}
        stroke={INK}
        strokeWidth="3"
      />
      <motion.path
        d="M80 62V32A30 30 0 1 1 50 62Z"
        fill={AMBER}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
        initial={from(reduce, { opacity: 0 })}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      />
      <motion.g
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
        style={around(80, 62)}
        initial={from(reduce, { rotate: 270 })}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.9, ease: [0.3, 0.7, 0.2, 1] }}
      >
        <line x1="80" y1="62" x2="80" y2="38" />
        <line x1="80" y1="62" x2="62" y2="62" />
      </motion.g>
      <circle cx="80" cy="62" r="5" fill={INK} />
    </>
  );
}

const ART = { goal: Goal, invite: Invite, time: Time };
export type EmptyArtName = keyof typeof ART;

export function EmptyArt({
  name,
  className,
}: {
  name: EmptyArtName;
  className?: string;
}) {
  const Art = ART[name];
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 160 110"
      aria-hidden="true"
      className={cn("h-[104px] w-auto", className)}
    >
      <Art reduce={reduce} />
    </svg>
  );
}
