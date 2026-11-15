"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";

import { pageFonts, type CardFonts } from "@/components/footon/gamification/share-card";
import { formatNumber } from "@/lib/format";
import { shareToTelegram } from "@/lib/gamification/share";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

export type TicketData = {
  name: string;
  code: string;
  /** The invite link without the scheme, e.g. `t.me/luckyfan_bot?start=sun9k`. */
  link: string;
  /** The match, home first: «لیورپول - منچسترسیتی • ۲۱:۰۰». */
  match: string;
  entry: number;
  /** A fixed stake per prediction, or null when everyone picks their own. */
  perCall: number | null;
  cap: number;
  slots: number;
  joined: number;
};

const fmt = formatNumber;

/**
 * The league invite as a matchday ticket: lime, notched, a dashed tear line.
 * The top names the league and the match; the stub carries the numbers (entry,
 * stake per prediction) and who's in; the strip at the foot is the invite link
 * with a Telegram button that sends the ticket (image + link). `created` stamps the ticket once the
 * league exists. The same ticket is drawn as an image for Telegram (`drawInviteTicket`).
 */
export function InviteTicket({ t, created = false, className }: { t: TicketData; created?: boolean; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  /** The ticket as a PNG (where Web Share takes files) + the bot link, through the Telegram share chain. */
  const share = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const file = await renderInviteTicket(t).catch(() => null);
      const method = await shareToTelegram({
        text: `بیا توی لیگ «${t.name || "لیگ تو"}» تا ببینیم کی بهتر پیش‌بینی می‌کنه. ${t.match} • ورودی ${fmt(t.entry)} سکه`,
        url: `https://${t.link}`,
        ...(file ? { file } : {}),
      });
      if (method) {
        setSent(true);
        setTimeout(() => setSent(false), 2400);
        track("card_shared", { surface: "league_invite", method });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="پیش‌نمایش دعوت" className={cn("relative rounded-2xl bg-primary text-primary-foreground", className)}>
      <div className="bg-[radial-gradient(rgb(4_23_14/0.12)_1px,transparent_1px)] bg-[length:12px_12px] rounded-t-2xl px-5 pt-[18px] pb-4">
        <div className="flex items-center justify-between gap-3 text-[12px] font-bold">
          <span className="flex items-center gap-1.5">
            <Send className="size-3.5 rtl:-scale-x-100" strokeWidth={2.6} aria-hidden="true" />
            دعوت به لیگ
          </span>
          {created ? (
            <span role="status" className="animate-in-up flex items-center gap-1 rounded-full bg-primary-foreground px-2 py-0.5 text-[11px] text-primary">
              <Check className="size-3" strokeWidth={3} aria-hidden="true" />
              ساخته شد
            </span>
          ) : (
            <span dir="ltr" className="font-mono text-[11px]">
              #{t.code}
            </span>
          )}
        </div>
        <p className="mt-3 truncate font-display text-[40px] leading-[1.15] font-black">{t.name || "لیگ تو"}</p>
        <p className="mt-1 truncate text-sm font-semibold opacity-80">{t.match}</p>
      </div>

      {/* tear line, with the two notches punched out of the edges */}
      <div aria-hidden="true" className="relative h-0">
        <div className="mx-[18px] border-t-2 border-dashed border-primary-foreground/30" />
        <span className="absolute top-0 -left-[11px] size-[22px] -translate-y-1/2 rounded-full bg-background" />
        <span className="absolute top-0 -right-[11px] size-[22px] -translate-y-1/2 rounded-full bg-background" />
      </div>

      <dl className="grid grid-cols-3 gap-2 px-5 pt-3.5 pb-3">
        <div>
          <dt className="text-[11px] font-semibold opacity-70">ورودی</dt>
          <dd className="font-display text-[22px] leading-tight font-bold">{fmt(t.entry)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold opacity-70">هر پیش‌بینی</dt>
          <dd className="font-display text-[22px] leading-tight font-bold">{t.perCall ? fmt(t.perCall) : "آزاد"}</dd>
        </div>
        <div className="flex flex-col items-end">
          <dt className="sr-only">بازیکن‌ها</dt>
          <dd className="flex -space-x-1.5 py-1" aria-hidden="true">
            {Array.from({ length: t.slots }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "size-6 rounded-full border-[1.5px] border-primary-foreground/45",
                  i < t.joined ? "border-solid bg-primary-foreground/20" : "border-dashed",
                )}
              />
            ))}
          </dd>
          <dd className="text-[11px] font-semibold opacity-70">
            {fmt(t.joined)} از {fmt(t.slots)} اومدن
          </dd>
        </div>
      </dl>

      {/* the invite link, part of the ticket, with its own way out: send the ticket to a Telegram group */}
      <div className="mx-3 mb-3 flex h-12 items-center gap-2 rounded-md bg-primary-foreground/10 ps-3 pe-1.5">
        <span dir="ltr" className="min-w-0 flex-1 truncate font-mono text-[12px] font-medium rtl:text-end">
          {t.link}
        </span>
        <button
          type="button"
          onClick={share}
          disabled={busy}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-sm bg-primary-foreground px-3 text-[13px] font-bold text-primary outline-none transition-[transform,opacity] duration-150 ease-spring focus-visible:ring-[3px] focus-visible:ring-primary-foreground/50 active:scale-95 disabled:opacity-70"
        >
          {sent ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : <Send className="size-4 rtl:-scale-x-100" strokeWidth={2.4} aria-hidden="true" />}
          <span aria-live="polite">{busy ? "صبر کن…" : sent ? "رفت" : "تلگرام"}</span>
          <span className="sr-only">: فرستادن دعوت لیگ توی تلگرام</span>
        </button>
      </div>
    </section>
  );
}

/* ---------- the same ticket as an image, for Telegram ---------- */

export const TICKET_CARD = { width: 1080, height: 1350 } as const;
const C = { bg: "#06140f", stripe: "rgb(255 255 255 / 0.022)", lime: "#43b883", ink: "#04170e", inkSoft: "rgb(4 23 14 / 0.62)", inkTint: "rgb(4 23 14 / 0.1)", fg: "#f3f8f4", muted: "#9db1a6" };

/**
 * Draws the invite ticket on the stadium ground (1080×1350, Telegram's tall
 * image): the lime ticket with its notches and tear line, the league, the
 * match, the numbers, the link strip, and «لاکی فن» under it. Pure drawing.
 */
export function drawInviteTicket(ctx: CanvasRenderingContext2D, t: TicketData, fonts: CardFonts & { mono: string }) {
  const { width: W, height: H } = TICKET_CARD;
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.stripe;
  for (let sx = 0; sx < W; sx += 128) ctx.fillRect(sx, 0, 64, H);

  const x = 90, y = 150, w = W - 180, h = 980, tear = y + 520, start = x + w - 70, end = x + 70;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 56);
  ctx.fillStyle = C.lime;
  ctx.fill();
  // notches
  ctx.fillStyle = C.bg;
  for (const cx of [x, x + w]) {
    ctx.beginPath();
    ctx.arc(cx, tear, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgb(4 23 14 / 0.3)";
  ctx.lineWidth = 5;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(x + 60, tear);
  ctx.lineTo(x + w - 60, tear);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.direction = "rtl";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = C.ink;
  ctx.textAlign = "right";
  ctx.font = `700 38px ${fonts.sans}`;
  ctx.fillText("دعوت به لیگ", start, y + 100);
  ctx.direction = "ltr";
  ctx.textAlign = "left";
  ctx.font = `500 34px ${fonts.mono}`;
  ctx.fillText(`#${t.code}`, end, y + 100);

  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.font = `900 132px ${fonts.display}`;
  ctx.fillText(t.name || "لیگ تو", start, y + 300, w - 140);
  ctx.fillStyle = C.inkSoft;
  ctx.font = `600 42px ${fonts.sans}`;
  ctx.fillText(t.match, start, y + 390, w - 140);
  ctx.font = `500 36px ${fonts.sans}`;
  ctx.fillText("بیا ببینیم کی بهتر پیش‌بینی می‌کنه.", start, y + 460, w - 140);

  // the numbers on the stub: entry (start), per prediction (middle), cap (end)
  const cols: [string, string, number, CanvasTextAlign][] = [
    ["ورودی", fmt(t.entry), start, "right"],
    ["هر پیش‌بینی", t.perCall ? fmt(t.perCall) : "آزاد", x + w / 2, "center"],
    ["سقف شرط", fmt(t.cap), end, "left"],
  ];
  for (const [label, value, cx, align] of cols) {
    ctx.textAlign = align;
    ctx.fillStyle = C.inkSoft;
    ctx.font = `600 34px ${fonts.sans}`;
    ctx.fillText(label, cx, tear + 100);
    ctx.fillStyle = C.ink;
    ctx.font = `800 84px ${fonts.display}`;
    ctx.fillText(value, cx, tear + 200);
  }

  // link strip
  const sy = y + h - 190;
  ctx.beginPath();
  ctx.roundRect(x + 50, sy, w - 100, 130, 36);
  ctx.fillStyle = C.inkTint;
  ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.direction = "ltr";
  ctx.textAlign = "center";
  ctx.font = `500 36px ${fonts.mono}`;
  ctx.fillText(t.link, x + w / 2, sy + 78, w - 160);

  // the mark under the ticket
  ctx.direction = "rtl";
  ctx.fillStyle = C.fg;
  ctx.textAlign = "right";
  ctx.font = `900 64px ${fonts.display}`;
  ctx.fillText("لاکی فن", W - 90, H - 80);
  ctx.fillStyle = C.muted;
  ctx.textAlign = "left";
  ctx.font = `500 34px ${fonts.sans}`;
  ctx.fillText("لینک را بزن و بیا توی لیگ", 90, H - 86);
  ctx.textAlign = "start";
}

export async function renderInviteTicket(t: TicketData): Promise<File | null> {
  const canvas = document.createElement("canvas");
  canvas.width = TICKET_CARD.width;
  canvas.height = TICKET_CARD.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  await document.fonts?.ready;
  const probe = document.createElement("span");
  probe.className = "font-mono";
  document.body.append(probe);
  const mono = getComputedStyle(probe).fontFamily;
  probe.remove();
  drawInviteTicket(ctx, t, { ...pageFonts(), mono });
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  return blob ? new File([blob], `luckyfan-invite-${t.code}.png`, { type: "image/png" }) : null;
}
