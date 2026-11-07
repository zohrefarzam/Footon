import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Football } from "./football";
import { PitchMarkings } from "./pitch-markings";

/**
 * Empty / not-built-yet state: a quiet patch of pitch with the ball on the
 * centre spot, a title, one line and one secondary action.
 */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="bg-turf relative isolate flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed border-line-strong px-8 py-14 text-center">
      <PitchMarkings className="-z-10" />
      <Football className="size-9 opacity-80" />
      <h1 className="mt-1 text-[22px] font-bold tracking-[-0.03em]">{title}</h1>
      <p className="max-w-[28ch] text-sm text-muted-foreground">{body}</p>
      {action && (
        <Button asChild variant="secondary" className="mt-2">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
