"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/challenges", label: "Challenges" },
  { href: "/predictions", label: "Predictions" },
] as const;

/**
 * The Challenges tab's two screens as title tabs: Challenges · Predictions.
 * Each is its own route (so it can be linked), shown as screen titles with the
 * lime underline of the `Tabs` primitive sliding between them. `count` puts a
 * small number next to Predictions (open slips you can still edit).
 */
export function HubTabs({ count, action }: { count?: number; action?: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <header className="flex items-end justify-between gap-3">
      <nav aria-label="Challenges and predictions" className="-mb-1 flex min-w-0 items-end gap-5">
        {TABS.map(({ href, label }) => {
          const active = pathname === href;
          const Title = active ? "h1" : "span";
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-1.5 pb-2 outline-none transition-colors duration-200 focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/60",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Title className={cn("font-bold tracking-[-0.03em] transition-[font-size] duration-200", active ? "text-[26px]" : "text-[20px] max-[359px]:text-[17px]")}>
                {label}
              </Title>
              {href === "/predictions" && !!count && (
                <span
                  aria-label={`${count} open`}
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-3 px-1.5 font-display text-[13px] leading-none font-bold text-foreground"
                >
                  {count}
                </span>
              )}
              {active && (
                <motion.span
                  layoutId={reduce ? undefined : "hub-tab-line"}
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
      {action}
    </header>
  );
}
