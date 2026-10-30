import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Empty / not-built-yet state. Dotted canvas, one line, one action. */
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
    <div className="bg-dots flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-strong px-8 py-16 text-center">
      <h1 className="text-[22px] font-bold tracking-[-0.03em]">{title}</h1>
      <p className="max-w-[28ch] text-sm text-muted-foreground">{body}</p>
      {action && (
        <Button asChild variant="secondary" className="mt-2">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
