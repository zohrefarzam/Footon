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
import { COSTS, ENTRY_TIERS, splitPool } from "@/lib/economy";
import { league } from "@/lib/mock-data";

/** Invite slots on the ticket; with you that's the pool size we preview. */
const SLOTS = 3;
const fmt = (n: number) => n.toLocaleString("en-US");
const MODES = [
  { id: "system", label: "System live questions", desc: "We ask during the match" },
  { id: "friends", label: "Friends' questions", desc: "Anyone in the league can ask" },
  { id: "pre", label: "Pre-match picks", desc: "Score and scorers before kickoff" },
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
  const modeCount = Object.values(modes).filter(Boolean).length;

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
      <section aria-label="Invite preview" className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground">
        <div className="bg-[radial-gradient(rgb(11_15_2/0.13)_1px,transparent_1px)] bg-[length:12px_12px] px-5 pt-[18px] pb-4">
          <div className="flex justify-between text-[11px] font-bold tracking-[0.1em]">
            <span>LEAGUE INVITE</span>
            <span className="font-mono tracking-normal">#{league.code}</span>
          </div>
          <p className="mt-2.5 truncate font-display text-[44px] leading-none font-bold uppercase italic">{name || "Your league"}</p>
          <p className="mt-1.5 text-sm font-semibold">Liverpool v Man City · 21:00</p>
        </div>
        <div className="mx-[18px] border-t-2 border-dashed border-primary-foreground/30" />
        <span aria-hidden="true" className="absolute top-[129px] -left-[11px] size-[22px] rounded-full bg-background" />
        <span aria-hidden="true" className="absolute top-[129px] -right-[11px] size-[22px] rounded-full bg-background" />
        <div className="flex items-center justify-between px-5 pt-3.5 pb-4">
          <div>
            <p className="text-[11px] font-semibold opacity-70">ENTRY</p>
            <p className="font-display text-2xl font-bold">{fmt(entry)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold opacity-70">MODES</p>
            <p className="font-display text-2xl font-bold">{modeCount}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex -space-x-1.5" aria-hidden="true">
              {Array.from({ length: SLOTS }, (_, i) => (
                <span key={i} className="size-6 rounded-full border-[1.5px] border-dashed border-primary-foreground/45" />
              ))}
            </div>
            <p className="text-[11px] font-semibold opacity-70">0 of {SLOTS} joined</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2">
        <Label htmlFor="league-name">League name</Label>
        <div className="relative">
          <Input id="league-name" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} className="pr-14" />
          <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 font-mono text-[11px] text-subtle">
            {name.length}/20
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <Label id="stake-label">Entry per match</Label>
          <span className="text-xs text-muted-foreground">Each player, into the pool</span>
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
          {SLOTS + 1} of you: pool <span className="font-display text-sm font-bold text-live">{fmt(split.pool)}</span>, {fmt(split.burned)} burned,
          winner takes <span className="font-display text-sm font-bold text-live">{fmt(split.payouts[0])}</span>. Points decide it.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">What do you predict?</span>
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

      <p className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
        <Coin className="size-[18px] text-[9px]" />
        <span>
          <span className="font-semibold text-live">+1,500</span> for each friend who finishes their first match
        </span>
      </p>

      <div className="flex-1" />

      <div className="flex flex-col gap-2.5">
        <div className="flex gap-2">
          <Button variant="secondary" size="lg" onClick={copy} aria-live="polite">
            {copied ? <Check /> : <Link2 />}
            {copied ? "Copied" : "Copy"}
          </Button>
          {short > 0 ? (
            <Button size="lg" className="min-w-0 flex-1" disabled>
              Need {fmt(short)} more coins
            </Button>
          ) : (
            <Button asChild size="lg" className="min-w-0 flex-1 justify-between ps-5 pe-4">
              <Link href="/play">
                <span>
                  Create<span className="max-[359px]:hidden"> and share</span>
                </span>
                <span className="flex items-center gap-1 font-display text-base font-bold">
                  {fmt(cost)}
                  <Coin className="size-4 text-[8px]" />
                  <span className="sr-only">coins</span>
                </span>
              </Link>
            </Button>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {short > 0 ? (
            <>
              Free table rewards and missions top you up.{" "}
              <Link href="/wallet" className="font-semibold text-foreground underline underline-offset-3">
                Ways to earn
              </Link>
            </>
          ) : (
            <>
              {fmt(COSTS.createLeague)} to create + your {fmt(entry)} entry · you have {fmt(balance)}
            </>
          )}
        </p>
      </div>
    </>
  );
}
