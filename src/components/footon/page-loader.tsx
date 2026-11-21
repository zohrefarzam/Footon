import { BallLoader } from "./ball-loader";
import { cn } from "@/lib/utils";

/** A whole screen (or its main body) waiting on data: the ball hops in the middle, nothing else moves. */
export function PageLoader({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex min-h-[55dvh] w-full items-center justify-center pt-20", className)}>
      <BallLoader size="lg" label={label} />
    </div>
  );
}
