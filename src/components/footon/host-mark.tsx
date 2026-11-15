import { House, Plane } from "lucide-react";

import { cn } from "@/lib/utils";

const TEXT = { home: "میزبان", away: "میهمان" } as const;

/**
 * Which side of a fixture a team is: a house for the host, a plane for the
 * visitors. Muted and small: it explains, it doesn't decorate. The plane is a
 * diagonal glyph, so it mirrors in RTL like the other diagonal arrows.
 * `label` adds the word («میزبان» / «میهمان»); without it the word is still
 * there for screen readers.
 */
export function HostMark({ side, label = false, className }: { side: "home" | "away"; label?: boolean; className?: string }) {
  const Icon = side === "home" ? House : Plane;
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 text-muted-foreground", className)}>
      <Icon className={cn("size-3 shrink-0", side === "away" && "rtl:-scale-x-100")} strokeWidth={2.2} aria-hidden="true" />
      <span className={label ? "text-[11px] leading-none font-medium" : "sr-only"}>{TEXT[side]}</span>
    </span>
  );
}

/**
 * The same mark as a tiny pin on a crest's outer corner, for tight rows where a
 * separate icon would cost the team name its width. Wrap the crest in a
 * `relative` box and put this inside.
 */
export function HostPin({ side, className }: { side: "home" | "away"; className?: string }) {
  const Icon = side === "home" ? House : Plane;
  return (
    <span
      className={cn(
        "absolute -bottom-1 flex size-3.5 items-center justify-center rounded-full bg-surface-3 text-muted-foreground ring-2 ring-surface",
        side === "home" ? "-start-1" : "-end-1",
        className,
      )}
    >
      <Icon className={cn("size-2.5", side === "away" && "rtl:-scale-x-100")} strokeWidth={2.4} aria-hidden="true" />
      <span className="sr-only">{TEXT[side]}</span>
    </span>
  );
}
