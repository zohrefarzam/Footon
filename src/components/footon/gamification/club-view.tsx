import { CalendarCheck, Snowflake } from "lucide-react";

import { formatNumber } from "@/lib/gamification/format";
import type { ClubItem, ItemLook, MyClub, ShopSlot, TierId } from "@/lib/gamification/schemas";
import { copy } from "@/lib/gamification/strings";
import { cn } from "@/lib/utils";
import { PitchMarkings } from "@/components/footon/pitch-markings";
import { BadgeGlyph } from "./badge-glyph";
import { TIER_ICON } from "./tier-badge";

/** The shirt outline (same mark as the Fantasy tile's shirts). */
export const SHIRT_PATH = "M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z";
const NEUTRAL: ItemLook = { primary: "var(--dim)", secondary: "var(--muted-foreground)" };

export function Shirt({ look = NEUTRAL, className }: { look?: ItemLook; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d={SHIRT_PATH} fill={look.primary} stroke={look.secondary} strokeWidth="1.2" strokeLinejoin="round" />
      {/* collar trim in the second colour */}
      <path d="M9 3.6a3 3 0 0 0 6 0" fill="none" stroke={look.secondary} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Boots({ look = NEUTRAL, className }: { look?: ItemLook; className?: string }) {
  const boot = "M2 9V4h5l1 3 7 1.5a2 2 0 0 1 1.5 2V12H2z";
  return (
    <svg viewBox="0 0 38 14" aria-hidden="true" className={className}>
      <path d={boot} fill={look.primary} stroke={look.secondary} strokeWidth="1" strokeLinejoin="round" />
      <path d={boot} transform="translate(19 0)" fill={look.primary} stroke={look.secondary} strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/** Stand stripes in the stadium's colours (a pattern, like the pitch, never a wash). */
const stands = (look: ItemLook) => ({
  backgroundColor: look.primary,
  backgroundImage: `repeating-linear-gradient(0deg, color-mix(in srgb, ${look.secondary} 14%, transparent) 0 2px, transparent 2px 10px)`,
});

/** A small picture of one item, for shop cards and the preview. */
export function ItemSwatch({ slot, look, className }: { slot: ShopSlot; look?: ItemLook; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center justify-center overflow-hidden rounded-md bg-surface-2", className)}>
      {slot === "kit" && <Shirt look={look} className="size-12" />}
      {slot === "boots" && <Boots look={look} className="w-14" />}
      {slot === "stadium" && look && <span className="size-full" style={stands(look)} />}
      {slot === "frame" && look && <span className="size-11 rounded-lg border-[3px]" style={{ borderColor: look.primary, boxShadow: `inset 0 0 0 1px ${look.secondary}` }} />}
      {slot === "freeze" && <Snowflake className="size-8 text-foreground" strokeWidth={1.8} />}
    </span>
  );
}

export type ClubPreview = { slot: Exclude<ShopSlot, "freeze">; item: ClubItem };

/**
 * A club as friends see it: the frame around it, the stadium behind, the kit
 * and boots in front, then name, level + tier, streak and pinned badges.
 * `preview` swaps one slot (the shop's try-on) without changing anything.
 */
export function MyClubView({
  club,
  tierName,
  preview,
  size = "full",
  className,
}: {
  club: MyClub;
  tierName: string;
  preview?: ClubPreview;
  size?: "full" | "compact";
  className?: string;
}) {
  const pick = (slot: ClubPreview["slot"]) => (preview?.slot === slot ? preview.item : club[slot]);
  const kit = pick("kit");
  const stadium = pick("stadium");
  const boots = pick("boots");
  const frame = pick("frame");
  const TierIcon = TIER_ICON[club.tier as TierId];
  const full = size === "full";

  return (
    <figure
      role="group"
      aria-label={copy.clubAria(club.name, club.level, tierName, kit?.name ?? null, club.streak)}
      className={cn("overflow-hidden rounded-3xl border-[3px] bg-surface", className)}
      style={{ borderColor: frame?.look?.primary ?? "var(--line-strong)" }}
    >
      <div
        aria-hidden="true"
        className={cn("relative isolate flex flex-col items-center justify-end overflow-hidden", full ? "h-[220px] pb-5" : "h-[150px] pb-3", !stadium && "bg-pitch floodlight")}
        style={stadium?.look ? stands(stadium.look) : undefined}
      >
        {!stadium && <PitchMarkings variant="box" className="-z-10" />}
        <Shirt look={kit?.look} className={cn("drop-shadow-[0_12px_18px_rgb(0_0_0/0.55)]", full ? "size-28" : "size-20")} />
        {boots && <Boots look={boots.look} className={cn("mt-1", full ? "w-16" : "w-12")} />}
      </div>
      <figcaption className={cn("flex flex-col gap-2 border-t border-line", full ? "p-4" : "px-3.5 py-3")}>
        <div className="flex items-center gap-2">
          <span className={cn("min-w-0 flex-1 truncate font-semibold", full ? "text-[17px]" : "text-[15px]")}>{club.name}</span>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-surface-3 px-2.5 py-1 text-xs font-semibold">
            <TierIcon className="size-3.5 text-muted-foreground" strokeWidth={2.2} aria-hidden="true" />
            {tierName}
          </span>
          <span className="shrink-0 font-display text-[17px] leading-none font-bold">
            <span className="text-[12px] text-muted-foreground">{copy.levelShort} </span>
            {formatNumber(club.level)}
          </span>
        </div>
        {(club.streak > 0 || club.pinnedBadges.length > 0) && (
          <div className="flex items-center gap-2">
            {club.streak > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-live-soft px-2 py-0.5 font-display text-[15px] font-bold text-live">
                <CalendarCheck className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
                {formatNumber(club.streak)}
              </span>
            )}
            <span className="ms-auto flex gap-1">
              {club.pinnedBadges.map((b) => (
                <BadgeGlyph key={b.id} badge={b} size="sm" />
              ))}
            </span>
          </div>
        )}
      </figcaption>
    </figure>
  );
}
