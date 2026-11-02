import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { InviteStrip } from "@/components/footon/invite-strip";
import { LiveDot } from "@/components/footon/live";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { challenges, invites, matches } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ordinal = (n: number) => `${n}${["th", "st", "nd", "rd"][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? "th"}`;

/**
 * Challenges hub: pending invites, the challenges you're in, and the one lime
 * action — start a new one. The invite modal and the full wizard land in Phase 3.
 */
export default function ChallengesPage() {
  const pending = invites.flatMap((i) => {
    const match = matches.find((m) => m.id === i.matchId);
    return match ? [{ ...i, match }] : [];
  });
  const mine = challenges.flatMap((c) => {
    const match = matches.find((m) => m.id === c.matchId);
    return match ? [{ ...c, match }] : [];
  });

  return (
    <AppShell>
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">Challenges</h1>
        <Button asChild size="sm" className="h-10 rounded-sm px-3.5">
          <Link href="/challenges/new">
            <Plus strokeWidth={2.4} aria-hidden="true" />
            New challenge
          </Link>
        </Button>
      </header>

      <div id="invites" className="scroll-mt-20">
        <InviteStrip invites={pending} />
      </div>

      <section aria-labelledby="mine-title" className="flex flex-col gap-2.5">
        <h2 id="mine-title" className="text-[13px] font-medium text-muted-foreground">
          Your challenges
        </h2>
        <Card className="overflow-hidden">
          {mine.map((c) => {
            const live = c.match.status === "live";
            const done = c.status === "finished";
            return (
              <Link
                key={c.id}
                href={live ? "/play" : `/match/${c.match.id}`}
                className="flex items-center gap-3 px-4 py-3.5 outline-none transition-colors hover:bg-[#141417] focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60 [&+&]:border-t [&+&]:border-line"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-[15px] font-semibold">
                    {c.name}
                    {c.mine && <span className="text-xs font-normal text-muted-foreground">by you</span>}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    {live && <LiveDot className="size-[5px]" />}
                    <span className="font-display text-[13px] font-bold">
                      {c.match.home.code} v {c.match.away.code}
                    </span>
                    · {c.entry.toLocaleString("en-US")} coins in
                  </p>
                </div>
                <AvatarGroup aria-label={`${c.members.length} players`}>
                  {c.members.map((x, i) => (
                    <Avatar key={i} className="size-6 ring-surface">
                      <AvatarFallback className={cn("text-[11px]", x === "Y" && "bg-primary text-primary-foreground")}>{x}</AvatarFallback>
                    </Avatar>
                  ))}
                </AvatarGroup>
                {c.rank ? (
                  <span
                    className={cn("w-10 text-end font-display text-xl font-bold", c.rank === 1 && "text-primary")}
                    aria-label={done ? `Finished ${ordinal(c.rank)}` : `${ordinal(c.rank)} now`}
                  >
                    {ordinal(c.rank)}
                  </span>
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </Card>
      </section>
    </AppShell>
  );
}
