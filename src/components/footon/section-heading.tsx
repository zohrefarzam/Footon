import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Matchday section heading: the title in the display face, uppercase, like a
 * broadcast lower-third ("BIG MATCHES", "YOUR LEAGUES"), with optional inline
 * extras (a badge, a count) and one quiet text link on the end. The link is
 * outside the heading so screen readers hear a clean title.
 */
export function SectionHeading({
  id,
  title,
  meta,
  action,
  className,
}: {
  id?: string;
  title: string;
  /** Inline extras after the title: a badge, a count, a short note. */
  meta?: React.ReactNode;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-6 items-center gap-2", className)}>
      <h2 id={id} className="shrink-0 whitespace-nowrap font-display text-[17px] leading-none font-bold tracking-[0.04em] uppercase">
        {title}
      </h2>
      {meta}
      {action && (
        <Link
          href={action.href}
          className="-my-3 ms-auto flex h-11 shrink-0 items-center gap-0.5 rounded-md ps-2 text-[13px] font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
        >
          {action.label}
          <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
