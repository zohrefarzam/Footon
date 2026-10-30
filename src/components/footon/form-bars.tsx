import { cn } from "@/lib/utils";

export type Outcome = "W" | "L" | "V";

const label: Record<Outcome, string> = { W: "win", L: "loss", V: "void" };

/**
 * Recent form as a tiny bar chart. Height carries the meaning as well as colour,
 * so it reads for colour-blind users: tall = win, short = loss, stub = void.
 */
export function FormBars({ results, className }: { results: Outcome[]; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Last ${results.length} predictions: ${results.map((r) => label[r]).join(", ")}`}
      className={cn("flex h-10 items-end gap-[5px]", className)}
    >
      {results.map((r, i) => (
        <span
          key={i}
          className={cn(
            "w-2.5 rounded-[3px] origin-bottom animate-in fade-in slide-in-from-bottom-2 fill-mode-both",
            r === "W" && "h-10 bg-win",
            r === "L" && "h-4 bg-loss",
            r === "V" && "h-1.5 bg-[#3f3f46]",
          )}
          style={{ animationDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
  );
}
