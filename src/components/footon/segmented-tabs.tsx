"use client";

import { useId } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Segmented control with a sliding lime pill (spring). Use for 2–4 filters.
 * Controlled: pass `value` and `onValueChange`.
 */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onValueChange,
  label,
  className,
}: {
  options: readonly T[];
  value: T;
  onValueChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn("grid rounded-md border border-line bg-surface p-1", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(opt)}
            className={cn(
              "relative h-9 rounded-sm text-sm font-semibold transition-colors duration-200",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-pill-${id}`}
                className="absolute inset-0 rounded-sm bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
            <span className="relative">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
