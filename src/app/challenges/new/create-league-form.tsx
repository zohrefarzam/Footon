"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Coin } from "@/components/footon/coin";
import { MatchPicker } from "@/components/footon/match-picker";
import { InviteTicket, type TicketData } from "@/components/footon/invite-ticket";
import { Button } from "@/components/ui/button";
import { Card, CardRow } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { COSTS, ENTRY_TIERS, STAKE_STEPS, splitPool } from "@/lib/economy";
import { cn } from "@/lib/utils";
import { league, type Match } from "@/lib/mock-data";
import { useProgress } from "@/lib/gamification/queries";
import { useCreateChallenge } from "@/lib/slips/challenges";
import { formatNumber, formatSigned, matchup } from "@/lib/format";

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
export function CreateLeagueForm({ balance: mockBalance }: { balance: number }) {
  // with a backend the league is really created (on a match you pick) and its invite code and link are the server's
  const live = !!process.env.NEXT_PUBLIC_GAMIFICATION_API;
  const router = useRouter();
  const createChallenge = useCreateChallenge();
  const progress = useProgress().data?.coins.free;
  const balance = live ? (progress ?? 0) : mockBalance;
  const [picked, setPicked] = useState<Match | null>(null);
  const [made, setMade] = useState<{ id: string; code: string; link: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [name, setName] = useState(live ? "" : league.name);
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

  const ticket: TicketData = {
    name,
    code: live ? (made?.code ?? "") : league.code,
    link: live ? (made?.link ?? "") : league.link,
    match: live ? (picked ? `${matchup(picked.home.name, picked.away.name)} • ${picked.kickoff}` : "یه بازی انتخاب کن") : `${matchup("لیورپول", "منچسترسیتی")} • امشب ۲۱:۰۰`,
    entry,
    perCall: fixedStake ? perCall : null,
    cap,
    slots: SLOTS,
    joined: 0,
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${live ? made?.link : league.link}`);
    } catch {
      /* clipboard can be blocked; still show feedback */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const create = async () => {
    if (!picked) return;
    setCreating(true);
    setFailed(false);
    const c = await createChallenge({ matchId: picked.id, name: name.trim(), entry, fixedStake: fixedStake ? perCall : null, cap });
    setCreating(false);
    if (c) setMade(c);
    else setFailed(true);
  };
  const canCreate = !!picked && name.trim().length > 0 && !creating;

  return (
    <>
      {/* the live invite ticket: updates as the form changes, and shares itself to Telegram */}
      <InviteTicket t={ticket} created={!!made} />

      {live && !made && <MatchPicker value={picked?.id ?? null} onChange={setPicked} />}

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
          {(!live || made) && (
            <Button variant="secondary" size="lg" onClick={copy} aria-live="polite">
              {copied ? <Check /> : <Link2 />}
              {copied ? "کپی شد" : "کپی"}
            </Button>
          )}
          {made ? (
            <Button size="lg" className="min-w-0 flex-1" onClick={() => router.push(`/challenges/${made.id}`)}>
              باز کردن چالش
            </Button>
          ) : short > 0 ? (
            <Button size="lg" className="min-w-0 flex-1" disabled>
              {fmt(short)} سکه کم داری
            </Button>
          ) : live ? (
            <Button size="lg" className="min-w-0 flex-1 justify-between ps-5 pe-4" disabled={!canCreate} onClick={create}>
              <span>{creating ? "صبر کن…" : "بساز"}</span>
              <span className="flex items-center gap-1 font-display text-base font-bold">
                {fmt(cost)}
                <Coin className="size-4 text-[8px]" />
                <span className="sr-only">سکه</span>
              </span>
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
        {failed && (
          <p role="alert" className="text-center text-xs text-muted-foreground">
            چالش ساخته نشد. دوباره امتحان کن.
          </p>
        )}
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
