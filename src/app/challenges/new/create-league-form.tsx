"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Link2 } from "lucide-react";

import { Coin } from "@/components/footon/coin";
import { Button } from "@/components/ui/button";
import { Card, CardRow } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { COSTS, ENTRY_TIERS, STAKE_STEPS, splitPool } from "@/lib/economy";
import { cn } from "@/lib/utils";
import { league } from "@/lib/mock-data";
import { formatNumber, formatSigned } from "@/lib/format";

/** Invite slots on the ticket; with you that's the pool size we preview. */
const SLOTS = 3;
const fmt = formatNumber;
const MODES = [
  { id: "system", label: "سؤال‌های زندهٔ فوتون", desc: "خودمون وسط بازی می‌پرسیم" },
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

  const copy = async () => {
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
      {/* Live invite ticket — updates as the form changes */}
      <section aria-label="پیش‌نمایش دعوت" className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground">
        <div className="bg-[radial-gradient(rgb(11_15_2/0.13)_1px,transparent_1px)] bg-[length:12px_12px] px-5 pt-[18px] pb-4">
          <div className="flex justify-between text-[11px] font-bold tracking-[0.1em]">
            <span>دعوت به لیگ</span>
            <span dir="ltr" className="font-mono tracking-normal">#{league.code}</span>
          </div>
          <p className="mt-2.5 truncate font-display text-[44px] leading-none font-bold uppercase italic">{name || "لیگ تو"}</p>
          <p className="mt-1.5 truncate text-sm font-semibold">لیورپول - منچسترسیتی • 21:00 • سقف {fmt(cap)}</p>
        </div>
        <div className="mx-[18px] border-t-2 border-dashed border-primary-foreground/30" />
        <span aria-hidden="true" className="absolute top-[129px] -left-[11px] size-[22px] rounded-full bg-background" />
        <span aria-hidden="true" className="absolute top-[129px] -right-[11px] size-[22px] rounded-full bg-background" />
        <div className="flex items-center justify-between px-5 pt-3.5 pb-4">
          <div>
            <p className="text-[11px] font-semibold opacity-70">ورودی</p>
            <p className="font-display text-2xl font-bold">{fmt(entry)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold opacity-70">هر پیش‌بینی</p>
            <p className="font-display text-2xl font-bold">{fixedStake ? fmt(perCall) : "آزاد"}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex -space-x-1.5" aria-hidden="true">
              {Array.from({ length: SLOTS }, (_, i) => (
                <span key={i} className="size-6 rounded-full border-[1.5px] border-dashed border-primary-foreground/45" />
              ))}
            </div>
            <p className="text-[11px] font-semibold opacity-70">{fmt(0)} از {fmt(SLOTS)} پیوسته‌اند</p>
          </div>
        </div>
      </section>

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

      <p className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
        <Coin className="size-[18px] text-[9px]" />
        <span>
          <span className="font-semibold text-live">{formatSigned(1500)}</span> برای هر دوستی که اولین بازی‌اش را تا آخر بازی کنه
        </span>
      </p>

      <div className="flex-1" />

      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2">
          <Button variant="secondary" size="lg" onClick={copy} aria-live="polite">
            {copied ? <Check /> : <Link2 />}
            {copied ? "کپی شد" : "کپی"}
          </Button>
          {short > 0 ? (
            <Button size="lg" className="min-w-0 flex-1" disabled>
              {fmt(short)} سکهٔ دیگر لازم داری
            </Button>
          ) : (
            <Button asChild size="lg" className="min-w-0 flex-1 justify-between ps-5 pe-4">
              <Link href="/play">
                <span>
                  بساز<span className="max-[359px]:hidden"> و بفرست</span>
                </span>
                <span className="flex items-center gap-1 font-display text-base font-bold">
                  {fmt(cost)}
                  <Coin className="size-4 text-[8px]" />
                  <span className="sr-only">سکه</span>
                </span>
              </Link>
            </Button>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {short > 0 ? (
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
