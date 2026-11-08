import { faPercent } from "@/lib/gamification/format";
import { cn } from "@/lib/utils";

/** How rare a badge is, as the share of users who hold it: "۹٫۵٪ کاربران دارند". */
export function RarityLabel({ pct, className }: { pct: number; className?: string }) {
  return (
    <span dir="rtl" lang="fa" className={cn("fa-scope text-xs text-muted-foreground", className)}>
      <bdi className="font-display text-[13px] font-bold text-foreground">{faPercent(pct)}</bdi> کاربران دارند
    </span>
  );
}
