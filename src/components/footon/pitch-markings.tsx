import { cn } from "@/lib/utils";

/**
 * Pitch line art for hero canvases: the halfway line and centre circle
 * (`centre`), or a penalty area seen from the touchline (`box`). Purely
 * decorative: it sits behind content at low contrast (`--pitch-line`), never
 * competes with text, and is `aria-hidden`. Place it inside a `relative
 * overflow-hidden` parent; it fills it.
 */
export function PitchMarkings({ variant = "centre", className }: { variant?: "centre" | "box"; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="var(--pitch-line)"
      strokeWidth="1.5"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    >
      {variant === "centre" ? (
        <>
          <path d="M200 0v220" vectorEffect="non-scaling-stroke" />
          <circle cx="200" cy="110" r="58" vectorEffect="non-scaling-stroke" />
          <circle cx="200" cy="110" r="3" fill="var(--pitch-line)" stroke="none" />
        </>
      ) : (
        <>
          <path d="M70 220V92h260v128" vectorEffect="non-scaling-stroke" />
          <path d="M140 220v-58h120v58" vectorEffect="non-scaling-stroke" />
          <path d="M160 92a52 52 0 0 1 80 0" vectorEffect="non-scaling-stroke" />
          <circle cx="200" cy="130" r="3" fill="var(--pitch-line)" stroke="none" />
        </>
      )}
    </svg>
  );
}
