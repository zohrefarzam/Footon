import { cn } from "@/lib/utils";

const sizes = {
  /** Shield only, no code: for dense rows that print the team name beside it. */
  xs: "size-5",
  sm: "size-[30px] rounded-[9px] text-[11px]",
  md: "size-[34px] rounded-sm text-[13px]",
  lg: "size-10 rounded-[12px] text-sm",
  xl: "size-14 text-[15px]",
};

/**
 * Placeholder crest. With `colors` it draws a generic shield in the club's
 * shirt + trim colours; without, the three-letter code on a rounded square.
 * Swap for real crest images when licensing allows; keep the same box.
 */
export function TeamCrest({
  code,
  colors,
  size = "md",
  className,
}: {
  code: string;
  colors?: [string, string];
  size?: keyof typeof sizes;
  className?: string;
}) {
  if (colors) {
    const [shirt, trim] = colors;
    return (
      <span className={cn("relative inline-flex shrink-0 items-center justify-center", sizes[size], className)}>
        <svg viewBox="0 0 40 46" aria-hidden="true" className="absolute inset-0 size-full">
          <path d="M20 2 37 8v14c0 11-7.5 18.5-17 22C10.5 40.5 3 33 3 22V8Z" fill={shirt} stroke={trim} strokeWidth="2.5" />
          <path d="M3 17h34" stroke={trim} strokeWidth="2" opacity=".5" />
        </svg>
        {size !== "xs" && (
          <span className="relative mt-[18%] font-display font-bold text-white" style={{ textShadow: "0 1px 2px rgb(0 0 0 / 0.6)" }}>
            {code}
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center border border-[#2a2a30] bg-[#1c1c21] font-display font-bold text-[#e4e4e7]",
        sizes[size],
        className,
      )}
    >
      {code}
    </span>
  );
}
