import { Flag, Layers, MessageSquareQuote, PartyPopper, Shield, Shirt, Snowflake, UserPlus } from "lucide-react";

import type { ShopItem } from "@/lib/mock-data";

/** One lucide icon per shop item kind; shared by `Shop` and `ShopPreview`. */
export const shopIcons = {
  pack: Layers,
  celebration: PartyPopper,
  banter: MessageSquareQuote,
  banner: Flag,
  freeze: Snowflake,
  league: Shield,
  kit: Shirt,
  slot: UserPlus,
} satisfies Record<ShopItem["icon"], unknown>;

export const formatShopCoins = (coins: number | [number, number]) =>
  Array.isArray(coins) ? `${coins[0].toLocaleString("en-US")}–${coins[1].toLocaleString("en-US")}` : coins.toLocaleString("en-US");
