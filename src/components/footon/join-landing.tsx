"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/footon/app-shell";
import { Coin } from "@/components/footon/coin";
import { LeagueBadge } from "@/components/footon/league-badge";
import { TeamCrest } from "@/components/footon/team-crest";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCoins } from "@/lib/economy";
import { dateKey } from "@/lib/football/fixtures";
import { formatNumber, matchup } from "@/lib/format";
import { useProgress } from "@/lib/gamification/queries";
import { lookupChallenge, useJoinByCode } from "@/lib/slips/challenges";

const noop = () => () => {};

/**
 * An invite link's page: who asked you in, which match, the entry and who's
 * already there, then the one lime action. Joined already → open it; closed →
 * say so. Short of coins → say how many, never push a purchase.
 */
export function JoinLanding({ code }: { code: string }) {
  const router = useRouter();
  const today = useSyncExternalStore(noop, () => dateKey(new Date()), () => null);
  const join = useJoinByCode();
  const balance = useProgress().data?.coins.free;
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const { data: c, isError } = useQuery({ queryKey: ["challenges", "code", code], enabled: !!today, queryFn: () => lookupChallenge(code, today!), retry: false });

  if (isError)
    return (
      <AppShell dock={false} className="justify-center">
        <p className="text-center text-[15px] font-semibold">این دعوت پیدا نشد</p>
        <p className="text-center text-sm text-muted-foreground">لینک اشتباهه یا چالش بسته شده.</p>
        <Button asChild variant="secondary" size="lg">
          <Link href="/challenges">چالش‌های من</Link>
        </Button>
      </AppShell>
    );
  if (!c)
    return (
      <AppShell dock={false} className="justify-center">
        <Skeleton className="h-72 w-full rounded-2xl" />
      </AppShell>
    );

  const m = c.match;
  const short = balance === undefined ? 0 : c.entry - balance;
  const open = c.status === "invited";
  const accept = async () => {
    setBusy(true);
    setFailed(false);
    const id = await join(code);
    setBusy(false);
    if (id) router.replace(`/challenges/${id}`);
    else setFailed(true);
  };

  return (
    <AppShell dock={false} className="justify-center gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <LeagueBadge name={c.name} size="lg" />
        <div>
          <p className="text-[13px] text-muted-foreground">{c.from ? `${c.from.name} دعوتت کرد به` : "دعوت به چالش"}</p>
          <h1 className="mt-0.5 text-[26px] font-bold tracking-[-0.03em]">{c.name}</h1>
        </div>
      </div>

      <Card className="gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="flex shrink-0" aria-hidden="true">
            <TeamCrest code={m.home.code} colors={m.home.colors} size="xs" className="relative z-10 size-[34px]" />
            <TeamCrest code={m.away.code} colors={m.away.colors} size="xs" className="-ms-3 size-[34px] opacity-90" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">{matchup(m.home.name, m.away.name)}</p>
            <p className="text-xs text-muted-foreground">
              {m.day ?? "امروز"} <span className="font-display text-[13px] font-bold text-foreground">{m.kickoff}</span> • {formatNumber(c.members.length)} نفر
            </p>
          </div>
        </div>
        <p className="flex items-center justify-between border-t border-line pt-3 text-sm text-muted-foreground">
          ورودی هر نفر
          <span className="flex items-center gap-1 font-display text-base font-bold text-live">
            {formatCoins(c.entry)}
            <Coin className="size-4 text-[8px]" />
            <span className="sr-only">سکه</span>
          </span>
        </p>
      </Card>

      {open ? (
        short > 0 ? (
          <div className="flex flex-col items-center gap-2">
            <Button size="lg" className="w-full" disabled>
              {formatNumber(short)} سکه کم داری
            </Button>
            <Link href="/wallet" className="text-sm font-semibold text-muted-foreground underline underline-offset-3">
              راه‌های گرفتن سکه
            </Link>
          </div>
        ) : (
          <Button size="lg" className="w-full justify-between ps-5 pe-4" disabled={busy} onClick={accept}>
            <span>{busy ? "صبر کن…" : "بپیوند"}</span>
            <span className="flex items-center gap-1 font-display text-base font-bold">
              {formatCoins(c.entry)}
              <Coin className="size-4 text-[8px]" />
            </span>
          </Button>
        )
      ) : c.status === "joined" || c.status === "finished" ? (
        <Button asChild size="lg" className="w-full">
          <Link href={`/challenges/${c.id}`}>قبلاً عضو شدی. باز کردن چالش</Link>
        </Button>
      ) : (
        <p className="text-center text-sm text-muted-foreground">این چالش بسته شده. چیزی ازت کم نشد.</p>
      )}
      {failed && (
        <p role="alert" className="text-center text-xs text-muted-foreground">
          نشد که بپیوندی. دوباره امتحان کن.
        </p>
      )}
    </AppShell>
  );
}
