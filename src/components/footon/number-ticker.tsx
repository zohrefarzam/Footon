"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

/**
 * Counts from `from` to `value` with an ease-out curve.
 * Use for rewards and wallet changes, never for static numbers.
 */
export function NumberTicker({
  value,
  from = 0,
  duration = 1.2,
  prefix = "",
  className,
}: {
  value: number;
  from?: number;
  duration?: number;
  prefix?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : from);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(from, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [from, value, duration, reduce]);

  return (
    <span className={className} aria-label={`${prefix}${value.toLocaleString("en-US")}`}>
      <span aria-hidden="true" className="tabular-nums">
        {prefix}
        {(reduce ? value : display).toLocaleString("en-US")}
      </span>
    </span>
  );
}
