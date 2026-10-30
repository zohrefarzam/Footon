import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { ChatSheet } from "@/components/footon/chat-sheet";
import { LiveMinute } from "@/components/footon/live";
import { QuestionCard } from "@/components/footon/question-card";
import { TeamCrest } from "@/components/footon/team-crest";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { chat, league, liveQuestion, matches } from "@/lib/mock-data";

const ordinal = ["1st", "2nd", "3rd", "4th"];

export default function PlayPage() {
  const m = matches.find((x) => x.status === "live")!;

  return (
    <AppShell dock={false} className="gap-0 px-0 pt-3.5 pb-2">
      <div className="flex flex-col gap-3.5 px-5">
        <div className="flex items-center gap-2.5">
          <Button asChild variant="secondary" size="icon-sm" aria-label="Back to home" className="rounded-[11px]">
            <Link href="/">
              <ChevronLeft />
            </Link>
          </Button>
          <span className="flex-1 text-[13px] text-muted-foreground">{league.name}</span>
          <LiveMinute minute={m.minute!} />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
          {(["home", "away"] as const).map((side, i) => {
            const t = m[side];
            return (
              <div key={side} className={cn("flex flex-col items-center gap-1.5 text-center", i === 1 && "col-start-3 row-start-1")}>
                <TeamCrest code={t.code} colors={t.colors} size="xl" />
                <span className="text-[13px] font-semibold">{t.name}</span>
                <ul className="text-xs text-muted-foreground">
                  {m.events
                    ?.filter((e) => e.side === side)
                    .map((e) => (
                      <li key={e.minute}>
                        {e.player} <span className="font-display">{e.minute}&apos;</span>
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
          <p
            aria-live="polite"
            className="col-start-2 row-start-1 pt-1 font-display text-[64px] leading-none font-bold"
            aria-label={`${m.home.name} ${m.score![0]}, ${m.away.name} ${m.score![1]}`}
          >
            {m.score![0]}
            <span className="mx-2.5 text-[#3f3f46]">:</span>
            {m.score![1]}
          </p>
        </div>

        <div
          className="relative mt-1 h-1 rounded-full bg-line"
          role="img"
          aria-label={`Minute ${m.minute} of 90. Goals at ${m.events?.map((e) => `${e.minute}'`).join(", ")}`}
        >
          <div className="absolute inset-y-0 left-0 rounded-full bg-[#3f3f46]" style={{ width: `${(m.minute! / 90) * 100}%` }} />
          <span className="absolute -top-[3px] left-1/2 h-2.5 w-px bg-[#52525b]" />
          {m.events?.map((e) => (
            <span
              key={e.minute}
              className={cn("absolute size-1.5 -translate-x-1/2 rounded-full bg-muted-foreground", e.side === "home" ? "-top-2.5" : "top-2")}
              style={{ left: `${(e.minute / 90) * 100}%` }}
            />
          ))}
          <span
            className="absolute -top-1 size-3 -translate-x-1/2 rounded-full border-[3px] border-background bg-foreground"
            style={{ left: `${(m.minute! / 90) * 100}%` }}
          />
        </div>

        <ul className="mt-1 grid grid-cols-3 text-center" aria-label="Match stats">
          {m.stats?.map((st) => (
            <li
              key={st.label}
              aria-label={`${st.label}: ${m.home.name} ${st.home}${st.unit ?? ""}, ${m.away.name} ${st.away}${st.unit ?? ""}`}
              className="flex flex-col items-center"
            >
              <span aria-hidden="true" className="text-[11px] text-muted-foreground">
                {st.label}
              </span>
              <span aria-hidden="true" className="font-display text-lg font-bold">
                {st.home}
                {st.unit}
                <span className="mx-1.5 text-subtle">–</span>
                {st.away}
                {st.unit}
              </span>
            </li>
          ))}
        </ul>

        <ol className="grid grid-cols-3 gap-2" aria-label="League standings">
          {league.standings.map((p, i) => (
            <li
              key={p.name}
              className={cn(
                "rounded-[12px] border px-2.5 py-2",
                p.you ? "border-primary-line bg-primary-soft" : "border-line bg-surface",
              )}
            >
              <div className={cn("flex justify-between text-[11px]", p.you ? "font-semibold text-primary" : "text-muted-foreground")}>
                <span>
                  {ordinal[i]} · {p.name}
                </span>
                {p.delta ? <span aria-label={`up ${p.delta}`}>▲{p.delta}</span> : null}
              </div>
              <div className={cn("mt-0.5 font-display text-[22px] font-bold", !p.you && "text-[#d4d4d8]")}>{p.points}</div>
            </li>
          ))}
        </ol>
      </div>

      <QuestionCard question={liveQuestion} className="mx-5 mt-5" />

      <div className="min-h-6 flex-1" />

      <ChatSheet chat={chat} members={league.standings} />
    </AppShell>
  );
}
