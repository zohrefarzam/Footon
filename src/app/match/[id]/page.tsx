import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { PrematchCalls } from "@/components/footon/prematch-calls";
import { StreakFlame } from "@/components/footon/streak";
import { TeamCrest } from "@/components/footon/team-crest";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HOT_STREAK, matches, prematchQuestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return matches.map((m) => ({ id: m.id }));
}

/** Any match from the list: upcoming → pre-match calls; finished → your result. Live goes to /play. */
export default async function MatchPage({ params }: PageProps<"/match/[id]">) {
  const { id } = await params;
  const m = matches.find((x) => x.id === id);
  if (!m) notFound();
  if (m.status === "live") redirect("/play");

  const done = m.status === "finished";
  const you = m.you;
  const questions = prematchQuestions.map((q) => ({
    ...q,
    text: q.text.replace("{home}", m.home.name).replace("{away}", m.away.name),
  }));

  return (
    <AppShell dock={false} className="gap-5 pt-3.5">
      <header className="flex h-10 items-center gap-3">
        <Button asChild variant="secondary" size="icon-sm" aria-label="Back to matches" className="rounded-[11px]">
          <Link href="/">
            <ChevronLeft className="rtl:rotate-180" />
          </Link>
        </Button>
        <p className="flex-1 truncate text-[15px] font-semibold">{m.caption}</p>
      </header>

      {/* scoreboard */}
      <section aria-label="Match" className="bg-dots -mx-5 flex items-center justify-between gap-2 px-5 py-6">
        {[m.home, m.away].map((t, i) => (
          <div key={t.code} className={cn("flex w-24 flex-col items-center gap-2 text-center", i === 1 && "order-3")}>
            <TeamCrest code={t.code} colors={t.colors} size="xl" />
            <span className="text-sm font-semibold">{t.name}</span>
          </div>
        ))}
        <div className="order-2 flex flex-col items-center gap-1">
          {done ? (
            <>
              <p className="font-display text-[56px] leading-none font-bold tabular-nums">
                {m.score![0]}
                <span className="mx-2 text-muted-foreground">–</span>
                {m.score![1]}
              </p>
              <span className="font-display text-base font-bold text-muted-foreground">FULL TIME</span>
            </>
          ) : (
            <>
              <p className="font-display text-[56px] leading-none font-bold">{m.kickoff}</p>
              <span className="text-[13px] font-medium text-muted-foreground">{m.day ?? "Today"}</span>
            </>
          )}
        </div>
      </section>

      {done ? (
        you ? (
          <Card className="gap-4 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] text-muted-foreground">You scored</p>
                <p className="font-display text-[56px] leading-[0.95] font-bold text-primary">+{you.points}</p>
              </div>
              {you.streak >= HOT_STREAK && <StreakFlame count={you.streak} size="md" />}
            </div>
            <div className="flex gap-1.5" role="img" aria-label={`${you.right} of ${you.calls} calls right`}>
              {Array.from({ length: you.calls }, (_, i) => (
                <span key={i} className={cn("h-2 flex-1 rounded-full", i < you.right ? "bg-win" : "h-1 self-center bg-loss")} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {you.right} of {you.calls}
              </span>{" "}
              calls right{you.streak >= HOT_STREAK ? `, ${you.streak} in a row to finish.` : "."}
            </p>
          </Card>
        ) : (
          <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">
            You didn&apos;t play this one. Calls open before every kickoff.
          </p>
        )
      ) : (
        <PrematchCalls questions={questions} made={you?.calls ?? 0} />
      )}
    </AppShell>
  );
}
