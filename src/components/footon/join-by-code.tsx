"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCoins } from "@/lib/economy";
import { formatNumber, matchup, toLatinDigits } from "@/lib/format";
import type { ChallengeWithMatch } from "@/lib/challenges";
import { lookupChallenge, useJoinByCode } from "@/lib/slips/challenges";
import { Coin } from "./coin";

/**
 * "Got a code?": paste it, see which challenge it is (match, entry, who's in),
 * then join. Both steps are secondary buttons: the Challenges tab's one lime
 * action is creating a challenge.
 */
export function JoinByCode({ today }: { today: string }) {
  const router = useRouter();
  const join = useJoinByCode();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [found, setFound] = useState<ChallengeWithMatch | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clean = () => toLatinDigits(code).trim();

  const find = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clean()) return;
    setBusy(true);
    setError(null);
    const c = await lookupChallenge(clean(), today).catch(() => null);
    setFound(c);
    if (!c) setError("چالشی با این کد پیدا نشد.");
    setBusy(false);
  };

  const accept = async () => {
    setBusy(true);
    const id = await join(clean());
    setBusy(false);
    if (id) router.push(`/challenges/${id}`);
    else setError("نشد که بپیوندی. موجودی یا کد را چک کن و دوباره امتحان کن.");
  };

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center gap-2 self-start rounded-md px-1 text-sm font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
      >
        <KeyRound className="size-4" aria-hidden="true" />
        کد دعوت داری؟
      </button>
    );

  return (
    <Card className="gap-3 p-4">
      <form onSubmit={find} className="flex flex-col gap-2">
        <Label htmlFor="join-code">کد چالش</Label>
        <div className="flex gap-2">
          <Input
            id="join-code"
            dir="ltr"
            autoFocus
            autoCapitalize="off"
            autoComplete="off"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setFound(null);
              setError(null);
            }}
            className="min-w-0 flex-1 font-mono"
          />
          <Button type="submit" variant="secondary" size="lg" disabled={busy || !clean()}>
            پیدا کن
          </Button>
        </div>
      </form>

      {error && (
        <p role="alert" className="text-xs text-muted-foreground">
          {error}
        </p>
      )}

      {found && (
        <div className="flex flex-col gap-3 border-t border-line pt-3" aria-live="polite">
          <div>
            <p className="text-[15px] font-semibold">{found.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {matchup(found.match.home.name, found.match.away.name)} • {found.match.day ?? "امروز"} {found.match.kickoff} • {formatNumber(found.members.length)} نفر
            </p>
          </div>
          {found.status === "invited" || found.status === "joined" ? (
            <Button variant="secondary" size="lg" disabled={busy || found.status === "joined"} onClick={accept} className="justify-between ps-5 pe-4">
              <span>{found.status === "joined" ? "قبلاً عضو شدی" : busy ? "صبر کن…" : "بپیوند"}</span>
              <span className="flex items-center gap-1 font-display text-base font-bold">
                {formatCoins(found.entry)}
                <Coin className="size-4 text-[8px]" />
                <span className="sr-only">سکه ورودی</span>
              </span>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">این چالش بسته شده.</p>
          )}
        </div>
      )}
    </Card>
  );
}
