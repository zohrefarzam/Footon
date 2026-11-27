"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LiveDot } from "./live";
import { ChallengesIcon, HomeIcon, LiveIcon, PredictionsIcon, ProfileIcon, type NavIconProps } from "./nav-icons";

type Item = { href: string; label: string; /** Shorter label under 360px, where five labels do not fit. */ short?: string; icon: (p: NavIconProps) => React.ReactNode; match: (p: string) => boolean };

const items: Item[] = [
  { href: "/", label: "خانه", icon: HomeIcon, match: (p) => p === "/" },
  { href: "/challenges", label: "چالش‌ها", icon: ChallengesIcon, match: (p) => p.startsWith("/challenges") },
  { href: "/predictions", label: "پیش‌بینی‌ها", short: "پیش‌بینی", icon: PredictionsIcon, match: (p) => p.startsWith("/predictions") },
  { href: "/live", label: "بازی ها", icon: LiveIcon, match: (p) => p.startsWith("/live") },
  { href: "/me", label: "پروفایل", icon: ProfileIcon, match: (p) => p.startsWith("/me") },
];

/**
 * Floating glass dock, 5 tabs: Home • Challenges • Predictions • Live • Profile. Active = filled icon + white label + lime dot.
 * The Live tab carries a pulsing amber dot while a match is on; the Challenges tab carries the count of
 * pending league invites as a small neutral badge (neutral: an invite is news, not a loss, a live moment or a CTA).
 * Rendered once by `app/(tabs)/layout.tsx`; hidden in focus mode.
 */
export function Dock({ live = false, invites = 0, className }: { live?: boolean; invites?: number; className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ناوبری اصلی"
      className={cn(
        "glass fixed bottom-[calc(18px+env(safe-area-inset-bottom))] left-1/2 z-40 grid h-[66px] w-[calc(min(100vw,430px)-32px)] -translate-x-1/2 grid-cols-5 items-center rounded-[24px] border border-line-strong px-1.5 max-[359px]:px-0.5 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.8)]",
        className,
      )}
    >
      {items.map(({ href, label, short, icon: Icon, match }) => {
        const active = match(pathname);
        const showLive = live && href === "/live";
        const count = href === "/challenges" ? invites : 0;
        const note = showLive ? "یه بازی زنده‌ست" : count > 0 ? `${formatNumber(count)} دعوت تازه` : null;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={note ? `${label}، ${note}` : undefined}
            className={cn(
              "flex h-full min-w-0 flex-col items-center justify-center gap-[3px] rounded-[18px] text-[11px] whitespace-nowrap outline-none transition-[color,transform] duration-200 ease-spring active:scale-90 focus-visible:ring-[3px] focus-visible:ring-ring/60",
              active ? "font-semibold text-foreground" : "font-medium text-nav-muted hover:text-foreground",
            )}
          >
            <span className="relative">
              <Icon active={active} />
              {showLive && <LiveDot className="absolute -end-0.5 -top-0.5 size-2" />}
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute animate-in-up -end-2.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-foreground px-1 font-display text-[11px] leading-none font-bold text-background ring-2 ring-surface-2"
                >
                  {count > 9 ? `${formatNumber(9)}+` : formatNumber(count)}
                </span>
              )}
            </span>
            {short ? (
              <>
                <span className="max-[359px]:hidden">{label}</span>
                <span className="min-[360px]:hidden">{short}</span>
              </>
            ) : (
              label
            )}
            <span aria-hidden="true" className={cn("size-1 rounded-full", active && "bg-primary")} />
          </Link>
        );
      })}
    </nav>
  );
}
