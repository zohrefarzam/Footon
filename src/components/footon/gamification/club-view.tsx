import { CalendarCheck } from "lucide-react";

import { formatNumber } from "@/lib/gamification/format";
import type { ClubItem, ItemLook, MyClub, ShopSlot, TierId } from "@/lib/gamification/schemas";
import { copy } from "@/lib/gamification/strings";
import { cn } from "@/lib/utils";
import { PitchMarkings } from "@/components/footon/pitch-markings";
import { BadgeGlyph } from "./badge-glyph";
import { TIER_ICON } from "./tier-badge";
import { BootArt, FrameArt, FreezeArt, KitArt, StadiumArt } from "./item-art";

/** The shirt outline (same mark as the Fantasy tile's shirts). */
export const SHIRT_PATH = "M8 3 3 6l2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z";
/** A picture of one item, for shop cards and the preview (the cartoon art in `item-art.tsx`). */
export function ItemSwatch({ slot, look, className }: { slot: ShopSlot; look?: ItemLook; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex items-center justify-center overflow-hidden rounded-md bg-surface-2", className)}>
      {slot === "kit" && <KitArt look={look} className="h-[86%] w-auto" />}
      {slot === "boots" && <BootArt look={look} className="w-[72%] max-w-28" />}
      {slot === "stadium" && <StadiumArt look={look} className="size-full" />}
      {slot === "frame" && <FrameArt look={look} className="h-[86%] w-auto" />}
      {slot === "freeze" && <FreezeArt look={look} className="h-[86%] w-auto" />}
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
        className={cn("relative isolate flex items-end justify-center gap-1 overflow-hidden", full ? "h-[220px] pb-4" : "h-[150px] pb-2.5", !stadium && "bg-pitch floodlight")}
      >
        {stadium?.look ? <StadiumArt look={stadium.look} className="absolute inset-0 -z-10 size-full" /> : <PitchMarkings variant="box" className="-z-10" />}
        <KitArt look={kit?.look} className={cn("drop-shadow-[0_12px_18px_rgb(0_0_0/0.55)]", full ? "size-32" : "size-24")} />
        {boots && <BootArt look={boots.look} className={cn("mb-1 drop-shadow-[0_6px_10px_rgb(0_0_0/0.5)]", full ? "w-16" : "w-12")} />}
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
