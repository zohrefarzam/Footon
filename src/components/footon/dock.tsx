"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleDot, House, Plus, Shirt, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: House },
  { href: "/play", label: "Play", icon: CircleDot },
  { href: "/league/new", label: "Create league", icon: Plus, primary: true },
  { href: "/team", label: "Team", icon: Shirt },
  { href: "/me", label: "Me", icon: UserRound },
] as const;

/**
 * Floating glass dock. Always 5 slots; the centre slot is the lime "create" action.
 * Hidden in focus mode (live match) — that screen uses its own back button.
 */
export function Dock({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "glass fixed bottom-[calc(18px+env(safe-area-inset-bottom))] left-1/2 z-40 grid w-[calc(min(100vw,430px)-32px)] -translate-x-1/2 h-[66px] grid-cols-5 items-center rounded-[24px] border border-line-strong px-1.5 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.8)]",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        if ("primary" in item && item.primary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="flex size-[50px] items-center justify-center justify-self-center rounded-[17px] bg-primary text-primary-foreground transition-transform duration-200 ease-spring active:scale-90"
            >
              <Icon className="size-[22px]" strokeWidth={2.4} />
            </Link>
          );
        }
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-[3px] text-[11px] transition-colors",
              active ? "font-semibold text-foreground" : "font-medium text-nav-muted hover:text-foreground",
            )}
          >
            <Icon className="size-[22px]" strokeWidth={1.8} />
            {item.label}
            <span className={cn("size-1 rounded-full", active && "bg-primary")} />
          </Link>
        );
      })}
    </nav>
  );
}
