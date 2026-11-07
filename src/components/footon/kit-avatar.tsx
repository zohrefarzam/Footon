import { cn } from "@/lib/utils";

const sizes = { sm: "size-7 text-[11px]", md: "size-8 text-[12px]" };

/**
 * A player in a league table as a tiny shirt with their initial on the chest,
 * the way a team sheet lists players. Your shirt is the brand green; everyone
 * else wears the neutral kit. Decorative: the name next to it carries the meaning.
 */
export function KitAvatar({ initial, you = false, size = "md", className }: { initial: string; you?: boolean; size?: keyof typeof sizes; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative inline-flex shrink-0 items-center justify-center", sizes[size], className)}>
      <svg viewBox="0 0 32 32" className="absolute inset-0 size-full">
        <path
          d="M11 3.5h10l1.2 1.8a3.5 3.5 0 0 1-6.2 0 3.5 3.5 0 0 1-6.2 0Zm0 0L4 7.2l2.6 6.3 3.4-1.5V28.5h12V12l3.4 1.5L28 7.2 21 3.5"
          fill={you ? "var(--primary)" : "var(--surface-3)"}
          stroke={you ? "var(--primary)" : "var(--line-strong)"}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
      <span className={cn("relative mt-[14%] font-display leading-none font-bold", you ? "text-primary-foreground" : "text-foreground")}>{initial}</span>
    </span>
  );
}
