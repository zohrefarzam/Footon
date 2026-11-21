import { Winky } from "./winky";
import { cn } from "@/lib/utils";

const sizes = { sm: "size-8", md: "size-12", lg: "size-16" };

/**
 * The loading mark: Winky bounces on the spot (squashing as it lands, tilting
 * at the top) over its shadow on the grass. Neutral: a wait is not a win.
 * `label` is announced to screen readers; reduced motion stops it after one
 * cycle (globals.css). Keep it in a box with headroom: it rises ~85% of its height.
 */
export function BallLoader({ label = "صبر کن…", size = "md", className }: { label?: string; size?: keyof typeof sizes; className?: string }) {
  return (
    <span role="status" className={cn("inline-flex flex-col items-center", className)}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className={cn("animate-ball-hop block origin-bottom", sizes[size])}>
        <Winky className="size-full" />
      </span>
      <span aria-hidden="true" className="animate-ball-shadow -mt-1 block h-[7px] w-[70%] rounded-[50%] bg-[#020a06]" />
    </span>
  );
}
