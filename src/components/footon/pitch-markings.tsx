import { cn } from "@/lib/utils";

/**
 * Pitch line art for hero canvases: the halfway line and centre circle
 * (`centre`), or a penalty area seen from the touchline (`box`). `corners`
 * adds the four corner-flag arcs in the card's own corners. Purely decorative:
 * it sits behind content at low contrast (`--pitch-line`), never competes with
 * text, and is `aria-hidden`. Place it inside a `relative overflow-hidden`
 * parent; it fills it.
 */
export function PitchMarkings({
  variant = "centre",
  corners = false,
  className,
}: {
  variant?: "centre" | "box" | "none";
  corners?: boolean;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      {variant !== "none" && (
        <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" fill="none" stroke="var(--pitch-line)" strokeWidth="1.5" className="absolute inset-0 size-full">
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
      )}
      {corners && (
        <>
          {/* corner-flag arcs: a quarter circle in each corner, like the corner of a pitch */}
          <span className="absolute -start-6 -top-6 size-12 rounded-full border border-(--pitch-line)" />
          <span className="absolute -end-6 -top-6 size-12 rounded-full border border-(--pitch-line)" />
          <span className="absolute -start-6 -bottom-6 size-12 rounded-full border border-(--pitch-line)" />
          <span className="absolute -end-6 -bottom-6 size-12 rounded-full border border-(--pitch-line)" />
        </>
      )}
    </span>
  );
}
