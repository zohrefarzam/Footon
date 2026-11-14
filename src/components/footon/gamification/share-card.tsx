"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MyClub } from "@/lib/gamification/schemas";
import { shareToTelegram } from "@/lib/gamification/share";
import { copy } from "@/lib/gamification/strings";
import { track } from "@/lib/track";
import { SHIRT_PATH } from "./club-view";
import { formatNumber } from "@/lib/format";

export const CARD = { width: 1080, height: 1350 } as const;

// the design tokens, as canvas needs literal colours
const C = { bg: "#06140f", surface: "#0b1e17", line: "#224236", pitch: "#0d2c1d", stripe: "rgb(255 255 255 / 0.022)", chalk: "rgb(255 255 255 / 0.09)", fg: "#f3f8f4", muted: "#9db1a6", live: "#ffa83e" };

export type CardFonts = { sans: string; display: string };

/** The page's real font stacks (next/font hashes the family names), so the card matches the app. */
export function pageFonts(): CardFonts {
  const probe = document.createElement("span");
  probe.className = "font-display";
  document.body.append(probe);
  const display = getComputedStyle(probe).fontFamily;
  probe.remove();
  return { sans: getComputedStyle(document.body).fontFamily, display };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/**
 * Draws a club as a 1080×1350 card (Telegram's tall image): dotted ground,
 * the club card with its frame, stadium stands, the kit, then name, level,
 * tier, streak and pinned badges, and the Lucky Fan mark. Pure drawing: give it
 * any 2D context.
 */
export function drawClubCard(ctx: CanvasRenderingContext2D, club: MyClub, tierName: string, fonts: CardFonts) {
  const { width: W, height: H } = CARD;
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  // mown-turf stripes, like the app's hero canvases
  ctx.fillStyle = C.stripe;
  for (let sx = 0; sx < W; sx += 128) ctx.fillRect(sx, 0, 64, H);

  // card + frame
  const x = 80, y = 110, w = W - 160, h = 1000, r = 64;
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = C.surface;
  ctx.fill();

  // stadium stands behind the kit
  ctx.save();
  roundRect(ctx, x, y, w, 560, [r, r, 0, 0]);
  ctx.clip();
  if (club.stadium?.look) {
    ctx.fillStyle = club.stadium.look.primary;
    ctx.fillRect(x, y, w, 560);
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = club.stadium.look.secondary;
    for (let sy = y + 20; sy < y + 560; sy += 40) ctx.fillRect(x, sy, w, 8);
    ctx.globalAlpha = 1;
  } else {
    // no stadium yet: the pitch, with a penalty box chalked on it
    ctx.fillStyle = C.pitch;
    ctx.fillRect(x, y, w, 560);
    ctx.strokeStyle = C.chalk;
    ctx.lineWidth = 3;
    ctx.strokeRect(x + w / 2 - 260, y + 360, 520, 200);
    ctx.strokeRect(x + w / 2 - 120, y + 480, 240, 80);
  }
  ctx.restore();

  // kit
  const look = club.kit?.look ?? { primary: "#2e4b3f", secondary: C.muted };
  ctx.save();
  ctx.translate(W / 2 - 216, y + 90);
  ctx.scale(18, 18);
  const shirt = new Path2D(SHIRT_PATH);
  ctx.fillStyle = look.primary;
  ctx.fill(shirt);
  ctx.strokeStyle = look.secondary;
  ctx.lineWidth = 0.6;
  ctx.lineJoin = "round";
  ctx.stroke(shirt);
  ctx.restore();

  ctx.strokeStyle = club.frame?.look?.primary ?? C.line;
  ctx.lineWidth = 12;
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();

  // name, level, tier: laid out right to left, like the app (start = the right edge)
  ctx.direction = "rtl";
  ctx.textBaseline = "alphabetic";
  const start = x + w - 64;
  const end = x + 64;
  ctx.textAlign = "right";
  ctx.fillStyle = C.fg;
  ctx.font = `700 64px ${fonts.sans}`;
  ctx.fillText(club.name, start, y + 680, w - 128);
  ctx.fillStyle = C.muted;
  ctx.font = `700 64px ${fonts.display}`;
  ctx.fillText(copy.levelShort, start, y + 860);
  const lvWidth = ctx.measureText(copy.levelShort).width;
  ctx.fillStyle = C.fg;
  ctx.font = `700 150px ${fonts.display}`;
  ctx.fillText(formatNumber(club.level), start - lvWidth - 18, y + 860);
  ctx.fillStyle = C.muted;
  ctx.font = `600 44px ${fonts.sans}`;
  ctx.textAlign = "left";
  ctx.fillText(tierName, end, y + 860);

  // streak on the start, pinned badges on the end
  const line = y + 940;
  if (club.streak > 0) {
    ctx.fillStyle = C.live;
    ctx.font = `600 40px ${fonts.sans}`;
    ctx.textAlign = "right";
    ctx.fillText(`${formatNumber(club.streak)} ${copy.streakUnit(club.streak)}`, start, line);
  }
  if (club.pinnedBadges.length > 0) {
    ctx.fillStyle = C.muted;
    ctx.font = `500 34px ${fonts.sans}`;
    ctx.textAlign = "left";
    ctx.fillText(club.pinnedBadges.map((b) => b.name).join(" • "), end, line, w / 2);
  }

  // mark: the name on the start corner, the line on the end
  ctx.fillStyle = C.fg;
  ctx.font = `800 60px ${fonts.display}`;
  ctx.textAlign = "right";
  ctx.fillText("لاکی فن", W - 80, H - 120);
  ctx.fillStyle = C.muted;
  ctx.font = `500 34px ${fonts.sans}`;
  ctx.textAlign = "left";
  ctx.fillText("بازی بعدی را با من پیش‌بینی کن", 80, H - 124);
  ctx.textAlign = "start";
}

export async function renderClubCard(club: MyClub, tierName: string): Promise<File | null> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD.width;
  canvas.height = CARD.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  await document.fonts?.ready;
  drawClubCard(ctx, club, tierName, pageFonts());
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  return blob ? new File([blob], "luckyfan-club.png", { type: "image/png" }) : null;
}

/**
 * "Share to Telegram": renders the club card as a PNG and hands it to the
 * Telegram share chain (Mini App → Web Share with the image → download + link).
 * A button, never a prompt. If the image can't be made, the link still goes.
 */
export function ShareCardRenderer({ club, tierName, className }: { club: MyClub; tierName: string; className?: string }) {
  const [busy, setBusy] = useState(false);

  const share = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const file = await renderClubCard(club, tierName).catch(() => null);
      const method = await shareToTelegram({ text: copy.shareClubText(club.name, club.level, tierName), ...(file ? { file } : {}) });
      if (method) track("card_shared", { surface: "my_club", method });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="secondary" size="lg" disabled={busy} onClick={share} className={className}>
      <Send className="rtl:-scale-x-100" aria-hidden="true" />
      {busy ? copy.sharing : copy.shareClub}
    </Button>
  );
}
