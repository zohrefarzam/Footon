import { cn } from "@/lib/utils";

/**
 * Loading placeholder: a block in `surface-2` that breathes while a screen
 * loads. Match the shape of what's coming (a crest is round, a row is a
 * row). Reduced motion stops the breathing (globals.css).
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" aria-hidden="true" className={cn("animate-skeleton rounded-md bg-surface-2", className)} {...props} />;
}

export { Skeleton };
