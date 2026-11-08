import { cn } from "@/lib/utils";

/**
 * Kit colours for friends' leagues. Like club colours on a crest, they are
 * identity (data), not UI roles, so they never reuse lime, amber or gold.
 */
const KITS: [string, string][] = [
  ["#1d4ed8", "#93c5fd"],
  ["#7c2d12", "#fdba74"],
  ["#581c87", "#d8b4fe"],
  ["#0f766e", "#99f6e4"],
  ["#9f1239", "#fda4af"],
  ["#334155", "#cbd5e1"],
];

function kitFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return KITS[h % KITS.length];
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

const sizes = { sm: "size-8 text-[11px]", md: "size-10 text-[13px]", lg: "size-14 text-lg" };

/**
 * A friends' league as a competition roundel: clubs are shields (`TeamCrest`),
 * competitions are round. The kit colours come from the league's name, so a
 * league always looks the same wherever it appears. `tone="silver"` is the
 * division badge.
 */
export function LeagueBadge({
  name,
  size = "md",
  tone,
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  tone?: "silver";
  className?: string;
}) {
  const [fill, ring] = tone === "silver" ? ["#8b9a92", "#e7eee9"] : kitFor(name);
  return (
    <span aria-hidden="true" className={cn("relative inline-flex shrink-0 items-center justify-center", sizes[size], className)}>
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full">
        <circle cx="20" cy="20" r="18.5" fill={fill} stroke={ring} strokeWidth="1.5" />
        <circle cx="20" cy="20" r="14.5" fill="none" stroke={ring} strokeOpacity=".45" strokeWidth="1" />
        <path d="m20 3.6 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3Z" fill={ring} />
      </svg>
      <span
        className="relative mt-[6%] font-display leading-none font-bold tracking-wide text-white"
        style={{ textShadow: "0 1px 2px rgb(0 0 0 / 0.5)" }}
      >
        {tone === "silver" ? "S" : initials(name)}
      </span>
    </span>
  );
}
