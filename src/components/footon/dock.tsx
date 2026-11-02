"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { LiveDot } from "./live";
import { ChallengesIcon, HomeIcon, LiveIcon, ProfileIcon, type NavIconProps } from "./nav-icons";

type Item = { href: string; label: string; icon: (p: NavIconProps) => React.ReactNode; match: (p: string) => boolean };

const items: Item[] = [
  { href: "/", label: "Home", icon: HomeIcon, match: (p) => p === "/" },
  { href: "/challenges", label: "Challenges", icon: ChallengesIcon, match: (p) => p.startsWith("/challenges") },
  { href: "/live", label: "Live", icon: LiveIcon, match: (p) => p.startsWith("/live") },
  { href: "/me", label: "Profile", icon: ProfileIcon, match: (p) => p.startsWith("/me") },
];

/**
 * Floating glass dock, 4 tabs. Active = filled icon + white label + lime dot.
 * The Live tab carries a pulsing amber dot while a match is on.
 * Rendered once by `app/(tabs)/layout.tsx`; hidden in focus mode.
 */
export function Dock({ live = false, className }: { live?: boolean; className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "glass fixed bottom-[calc(18px+env(safe-area-inset-bottom))] left-1/2 z-40 grid h-[66px] w-[calc(min(100vw,430px)-32px)] -translate-x-1/2 grid-cols-4 items-center rounded-[24px] border border-line-strong px-1.5 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.8)]",
        className,
      )}
    >
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        const showLive = live && href === "/live";
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={showLive ? `${label}, a match is live` : undefined}
            className={cn(
              "flex h-full min-w-12 flex-col items-center justify-center gap-[3px] rounded-[18px] text-[11px] outline-none transition-[color,transform] duration-200 ease-spring active:scale-90 focus-visible:ring-[3px] focus-visible:ring-ring/60",
              active ? "font-semibold text-foreground" : "font-medium text-nav-muted hover:text-foreground",
            )}
          >
            <span className="relative">
              <Icon active={active} />
              {showLive && <LiveDot className="absolute -end-0.5 -top-0.5 size-2" />}
            </span>
            {label}
            <span aria-hidden="true" className={cn("size-1 rounded-full", active && "bg-primary")} />
          </Link>
        );
      })}
    </nav>
  );
}
