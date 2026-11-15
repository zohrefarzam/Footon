"use client";

import { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";

import { Coin } from "@/components/footon/coin";
import { InviteTicket, renderInviteTicket, type TicketData } from "@/components/footon/invite-ticket";
import { Button } from "@/components/ui/button";
import { Card, CardRow } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { COSTS, ENTRY_TIERS, STAKE_STEPS, splitPool } from "@/lib/economy";
import { cn } from "@/lib/utils";
import { league } from "@/lib/mock-data";
import { formatNumber, formatSigned, matchup } from "@/lib/format";
import { shareToTelegram, type ShareMethod } from "@/lib/gamification/share";
import { track } from "@/lib/track";

/** Invite slots on the ticket; with you that's the pool size we preview. */
const SLOTS = 3;
const fmt = formatNumber;
const MODES = [
  { id: "system", label: "سؤال‌های زندهٔ لاکی فن", desc: "خودمون وسط بازی می‌پرسیم" },
  { id: "friends", label: "سؤال‌های دوستان", desc: "هر کسی توی لیگ می‌تونه بپرسه" },
  { id: "pre", label: "پیش‌بینی پیش از بازی", desc: "نتیجه و گلزن‌ها قبل از شروع" },
] as const;

/**
 * Create a friends' league: name, entry per match (the coin table), modes.
 * Creating costs coins on top of your own first entry. If you're short, the
 * button says so and points to ways to earn; it never offers a purchase.
 */
export function CreateLeagueForm({ balance }: { balance: number }) {
  const [name, setName] = useState(league.name);
  const [stakeIndex, setStakeIndex] = useState(1);
  const entry = ENTRY_TIERS[stakeIndex];
  const split = splitPool(entry, SLOTS + 1);
  const cost = COSTS.createLeague + entry;
  const short = cost - balance;
  const [modes, setModes] = useState<Record<string, boolean>>({ system: true, friends: true, pre: false });
  const [copied, setCopied] = useState(false);
  /** Stake rules for every prediction in the league: fixed per call, and a total cap per player. */
  const [fixedStake, setFixedStake] = useState(false);
  const [perCall, setPerCall] = useState<number>(STAKE_STEPS[1]);
  const [capIndex, setCapIndex] = useState(ENTRY_TIERS.length - 1);
  const cap = ENTRY_TIERS[capIndex];

  const [created, setCreated] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<ShareMethod | null>(null);
  const ticket: TicketData = {
    name,
    code: league.code,
    link: league.link,
    match: `${matchup("لیورپول", "منچسترسیتی")} • امشب ۲۱:۰۰`,
    entry,
    perCall: fixedStake ? perCall : null,
    cap,
    slots: SLOTS,
    joined: 0,
  };

  /** Create the league (mock: instant), then send the ticket to a Telegram group; the image rides along where it can. */
  const send = async () => {
    if (sending) return;
    setSending(true);
    setCreated(true);
    try {
      const file = await renderInviteTicket(ticket).catch(() => null);
      const method = await shareToTelegram({
        text: `بیا توی لیگ «${ticket.name || "لیگ تو"}» تا ببینیم کی بهتر پیش‌بینی می‌کنه. ${ticket.match} • ورودی ${fmt(entry)} سکه`,
        url: `https://${league.link}`,
        ...(file ? { file } : {}),
      });
      if (method) {
        setSent(method);
        track("card_shared", { surface: "league_invite", method });
      }
    } finally {
      setSending(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${league.link}`);
    } catch {
      /* clipboard can be blocked; still show feedback */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      {/* the live invite ticket: updates as the form changes, and is what goes to Telegram */}
      <InviteTicket t={ticket} created={created} copied={copied} onCopy={copyLink} />

      <fieldset disabled={created} className="contents">

      <div className="flex flex-col gap-2">
        <Label htmlFor="league-name">نام لیگ</Label>
        <div className="relative">
          <Input id="league-name" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} className="pe-14" />
          <span className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 font-mono text-[11px] text-subtle">
            {fmt(name.length)}/{fmt(20)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label id="stake-label">ورودی هر بازی</Label>
          <span className="text-xs text-muted-foreground">هر بازیکن، به صندوق</span>
        </div>
        <Slider
          aria-labelledby="stake-label"
          min={0}
          max={ENTRY_TIERS.length - 1}
          step={1}
          value={[stakeIndex]}
          onValueChange={([v]) => setStakeIndex(v)}
          className="px-3"
        />
        <div className="flex justify-between px-1 font-display text-[15px] font-bold" aria-hidden="true">
          {ENTRY_TIERS.map((s, i) => (
            <button key={s} type="button" onClick={() => setStakeIndex(i)} className={i === stakeIndex ? "text-foreground" : "text-muted-foreground"}>
              {fmt(s)}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          با {fmt(SLOTS + 1)} نفر: صندوق <span className="font-display text-sm font-bold text-live">{fmt(split.pool)}</span>، {fmt(split.burned)} می‌سوزه،
          برنده <span className="font-display text-sm font-bold text-live">{fmt(split.payouts[0])}</span> می‌بره. برنده را امتیاز تعیین می‌کنه.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">سر چی پیش‌بینی می‌کنید؟</span>
        <Card className="overflow-hidden rounded-lg">
          {MODES.map((m) => (
            <CardRow key={m.id} className="py-3.5">
              <label htmlFor={`mode-${m.id}`} className="flex-1 cursor-pointer">
                <span className="block text-[15px] font-semibold">{m.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{m.desc}</span>
              </label>
              <Switch
                id={`mode-${m.id}`}
                checked={modes[m.id]}
                onCheckedChange={(v) => setModes((prev) => ({ ...prev, [m.id]: v }))}
              />
            </CardRow>
          ))}
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">مبلغ پیش‌بینی‌ها</span>
        <Card className="overflow-hidden rounded-lg">
          <CardRow className="py-3.5">
            <label htmlFor="fixed-stake" className="flex-1 cursor-pointer">
              <span className="block text-[15px] font-semibold">مبلغ یکسان برای همه</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {fixedStake ? "همهٔ پیش‌بینی‌ها همین مبلغ پایین را دارن" : "هر کسی مبلغ خودش را انتخاب می‌کنه"}
              </span>
            </label>
            <Switch id="fixed-stake" checked={fixedStake} onCheckedChange={setFixedStake} />
          </CardRow>
          {fixedStake && (
            <CardRow className="animate-in-up gap-1.5 py-3">
              <span id="per-call-label" className="sr-only">
                مبلغ هر پیش‌بینی
              </span>
              <div role="radiogroup" aria-labelledby="per-call-label" className="flex flex-1 gap-1.5">
                {STAKE_STEPS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={perCall === s}
                    onClick={() => setPerCall(s)}
                    className={cn(
                      "h-9 flex-1 rounded-sm border font-display text-[15px] font-bold outline-none transition-[transform,background-color,border-color,color] duration-150 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60",
                      perCall === s ? "border-primary-line bg-primary-soft text-primary" : "border-line-strong bg-surface-2 text-muted-foreground",
                    )}
                  >
                    {fmt(s)}
                  </button>
                ))}
              </div>
            </CardRow>
          )}
          <div className="flex flex-col gap-3 border-t border-line px-4 py-3.5">
            <div className="flex items-baseline justify-between">
              <span id="cap-label" className="text-[15px] font-semibold">
                بیشترین شرط یک بازیکن
              </span>
              <span className="font-display text-base font-bold text-live">{fmt(cap)}</span>
            </div>
            <Slider
              aria-labelledby="cap-label"
              min={0}
              max={ENTRY_TIERS.length - 1}
              step={1}
              value={[capIndex]}
              onValueChange={([v]) => setCapIndex(v)}
              className="px-3"
            />
            <p className="text-xs text-muted-foreground">جمع شرط‌هاش روی این بازی.</p>
          </div>
        </Card>
      </div>

      </fieldset>

      <p className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
        <Coin className="size-[18px] text-[9px]" />
        <span>
          <span className="font-semibold text-live">{formatSigned(1500)}</span> برای هر دوستی که اولین بازی‌اش را تا آخر بازی کنه
        </span>
      </p>

      <div className="flex-1" />

      <div className="flex flex-col gap-2.5">
        {created ? (
          <div className="flex gap-2">
            <Button variant="secondary" size="lg" disabled={sending} onClick={send}>
              <Send className="rtl:-scale-x-100" aria-hidden="true" />
              {sending ? "دارم می‌فرستم…" : "دوباره بفرست"}
            </Button>
            <Button asChild size="lg" className="min-w-0 flex-1">
              <Link href="/play">برو به لیگ</Link>
            </Button>
          </div>
        ) : short > 0 ? (
          <Button size="lg" className="w-full" disabled>
            {fmt(short)} سکهٔ دیگر لازم داری
          </Button>
        ) : (
          <Button size="lg" className="w-full justify-between ps-5 pe-4" onClick={send} disabled={sending} aria-label={`بساز و توی تلگرام بفرست، ${fmt(cost)} سکه`}>
            <span className="flex items-center gap-2">
              <Send className="rtl:-scale-x-100" aria-hidden="true" />
              <span>
                بساز و<span className="max-[359px]:hidden"> توی تلگرام</span> بفرست
              </span>
            </span>
            <span className="flex items-center gap-1 font-display text-base font-bold">
              {fmt(cost)}
              <Coin className="size-4 text-[8px]" />
              <span className="sr-only">سکه</span>
            </span>
          </Button>
        )}
        <p className="text-center text-xs text-muted-foreground">
          {created ? (
            <span role="status">
              {sent === "download"
                ? "عکس بلیت ذخیره شد. توی تلگرام بفرستش، لینک هم باهاشه."
                : sent
                  ? "لیگ ساخته شد و دعوتش رفت. هر کی بیاد اینجا می‌بینیش."
                  : "لیگ ساخته شد. لینک را برای دوستات بفرست."}
            </span>
          ) : short > 0 ? (
            <>
              با جایزه‌های جدول رایگان و مأموریت‌ها سکه‌ات دوباره پر میشه.{" "}
              <Link href="/wallet" className="font-semibold text-foreground underline underline-offset-3">
                راه‌های گرفتن سکه
              </Link>
            </>
          ) : (
            <>
              {fmt(COSTS.createLeague)} برای ساختن + {fmt(entry)} ورودی خودت • موجودی {fmt(balance)}
            </>
          )}
        </p>
      </div>
    </>
  );
}
