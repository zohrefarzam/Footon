import { cn } from "@/lib/utils";

/**
 * Footon's own dock icons — the one exception to "lucide only" (see AGENTS.md).
 * 24px grid, `currentColor`. Inactive = 1.8 stroke outline; active = filled
 * silhouette with the inner detail knocked out in the background colour, so the
 * state differs by shape, not just colour.
 */
export type NavIconProps = { active?: boolean; className?: string };

function Svg({ active, className, children }: NavIconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      data-active={active || undefined}
      className={cn("size-6 shrink-0", className)}
    >
      {children}
    </svg>
  );
}

/** Home: a house with a goal-mouth door. */
export function HomeIcon({ active, className }: NavIconProps) {
  return (
    <Svg active={active} className={className}>
      <path d="M3.5 10.2 12 3.2l8.5 7V20a1 1 0 0 1-1 1H15v-5.5H9V21H4.5a1 1 0 0 1-1-1z" fill={active ? "currentColor" : "none"} />
    </Svg>
  );
}

/** Challenges: a cup with a star, the thing you play your friends for. */
export function ChallengesIcon({ active, className }: NavIconProps) {
  return (
    <Svg active={active} className={className}>
      <path d="M7 3.5h10v5.5a5 5 0 0 1-10 0z" fill={active ? "currentColor" : "none"} />
      <path d="M7 5.5H4.2v1.2A3.3 3.3 0 0 0 7.4 10M17 5.5h2.8v1.2a3.3 3.3 0 0 1-3.2 3.3M12 14v3.5M8 20.5h8M9.5 17.5h5" />
      <path
        d="m12 5.6.8 1.5 1.6.3-1.2 1.1.3 1.6-1.5-.8-1.5.8.3-1.6-1.2-1.1 1.6-.3z"
        strokeWidth={1.2}
        className={active ? "fill-background stroke-background" : undefined}
      />
    </Svg>
  );
}

/** Predictions: a dart in the target — you call it before it happens. */
export function PredictionsIcon({ active, className }: NavIconProps) {
  const knock = active ? "stroke-background" : undefined;
  return (
    <Svg active={active} className={className}>
      <circle cx="11" cy="13" r="8" fill={active ? "currentColor" : "none"} />
      <circle cx="11" cy="13" r="4.2" className={knock} />
      <circle cx="11" cy="13" r="1" className={active ? "fill-background stroke-background" : "fill-current"} />
      {active && <path d="M11 13 19.5 4.5" strokeWidth={2.6} className="stroke-background" />}
      <path d="M11 13 19.5 4.5M16.5 4.5h3v3" />
    </Svg>
  );
}

/** Live: a football sending signal — something is happening right now. */
export function LiveIcon({ active, className }: NavIconProps) {
  const knock = active ? "stroke-background" : undefined;
  return (
    <Svg active={active} className={className}>
      <circle cx="10" cy="12" r="7" fill={active ? "currentColor" : "none"} />
      <path d="M10 9.6 12.3 11.3 11.4 13.9H8.6L7.7 11.3z" className={active ? "fill-background stroke-background" : undefined} strokeWidth={1.4} />
      <path d="M10 9.6V5M12.3 11.3l4.3-1.5M11.4 13.9l2.7 3.7M8.6 13.9l-2.7 3.7M7.7 11.3 3.4 9.8" strokeWidth={1.4} className={knock} />
      <path d="M19.4 8.6a5 5 0 0 1 0 6.8M21.6 6.3a8.4 8.4 0 0 1 0 11.4" />
    </Svg>
  );
}

/** Profile: your shirt. */
export function ProfileIcon({ active, className }: NavIconProps) {
  return (
    <Svg active={active} className={className}>
      <path d="M8.5 3.5 3.5 6.3l2 4 1.8-.9V20.5h9.4V9.4l1.8.9 2-4-5-2.8a3.5 3.5 0 0 1-7 0z" fill={active ? "currentColor" : "none"} />
      <path d="M12 12.5v4" strokeWidth={2.2} className={active ? "stroke-background" : undefined} />
    </Svg>
  );
}
