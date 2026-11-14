"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { formatNumber, ltr } from "@/lib/format";

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
  // always start from `from` so server and client markup agree; reduced motion jumps straight to the value after mount
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    const controls = animate(from, value, {
      duration: reduce ? 0 : duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [from, value, duration, reduce]);

  return (
    <span className={className} aria-label={prefix ? ltr(`${prefix}${formatNumber(value)}`) : formatNumber(value)}>
      <span aria-hidden="true" dir="ltr" className="tabular-nums">
        {prefix}
        {formatNumber(display)}
      </span>
    </span>
  );
}
