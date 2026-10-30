import { cn } from "@/lib/utils";

/**
 * Placeholder crest: three-letter code in the display font on a rounded square.
 * Swap for real crest images when licensing allows; keep the same box.
 */
export function TeamCrest({
  code,
  size = "md",
  className,
}: {
  code: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center border border-[#2a2a30] bg-[#1c1c21] font-display font-bold text-[#e4e4e7]",
        size === "sm" && "size-[30px] rounded-[9px] text-[11px]",
        size === "md" && "size-[34px] rounded-sm text-[13px]",
        size === "lg" && "size-10 rounded-[12px] text-sm",
        className,
      )}
    >
      {code}
    </span>
  );
}
