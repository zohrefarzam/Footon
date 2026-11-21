"use client";

import { Check, Clock, X } from "lucide-react";

import { ComboMeter } from "@/components/footon/gamification/combo-meter";
import { QuestionCard } from "@/components/footon/question-card";
import { Card as Panel } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import { useAnswerQuestion, useCurrentQuestion, useLiveStats, type CurrentQuestion } from "@/lib/slips/live";
import { RESULT_WAIT_MS, useLiveMemory } from "@/lib/slips/live-memory";

function OpenCard({ matchId, kickoffAt, q, rightNow, clock }: { matchId: string; kickoffAt: string; q: Extract<CurrentQuestion, { kind: "open" }>; rightNow: number; clock: number }) {
  const answer = useAnswerQuestion(matchId, q.id);
  const remember = useLiveMemory((m) => m.remember);
  const onAnswer = (a: "yes" | "no") => {
    answer(a);
    remember(matchId, { id: q.id, index: q.question.index, total: q.question.total, text: q.question.text, myAnswer: a, rightBefore: rightNow, at: clock || Date.now() });
  };
  return <QuestionCard question={q.question} initialAnswer={q.myAnswer} onAnswer={onAnswer} reward={{ matchId, questionId: q.id, kickoffAt }} />;
}

const word = (a: "yes" | "no") => (a === "yes" ? "بله" : "نه");

/**
 * A question that has closed: waiting for the answer, or how yours went. The
 * outcome reads by shape and words, not colour alone (✓ disc, ✗ ring, clock).
 * A wrong call is said kindly and never in red alarm.
 */
function ResultCard({ q }: { q: Extract<CurrentQuestion, { kind: "waiting" | "done" }> }) {
  const waiting = q.kind === "waiting";
  const title = waiting
    ? q.myAnswer
      ? "قفل شد. منتظر نتیجه‌ایم."
      : "قفل شد. جوابی ندادی."
    : q.outcome === "right"
      ? "درست گفتی"
      : q.outcome === "wrong"
        ? "این یکی نشد"
        : q.outcome === "void"
          ? "این سؤال باطل شد"
          : q.myAnswer
            ? "نتیجه‌اش توی آمارت حساب میشه"
            : "جوابی ندادی";
  return (
    <Panel className="gap-2.5 p-4" aria-live="polite">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">
        سؤال {formatNumber(q.index)}/{formatNumber(q.total)}
      </p>
      <p className="text-[15px] font-semibold">{q.text}</p>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            q.outcome === "right" && "bg-primary-soft text-primary",
            q.outcome === "wrong" && "border border-loss/60 text-loss",
            (waiting || q.outcome === "void" || !q.outcome) && "bg-surface-3 text-muted-foreground",
          )}
        >
          {waiting || q.outcome === "void" || !q.outcome ? <Clock className="size-4" /> : q.outcome === "right" ? <Check className="size-4" strokeWidth={2.8} /> : <X className="size-4" strokeWidth={2.8} />}
        </span>
        <p className="min-w-0 flex-1 text-sm">
          <span className={cn("font-semibold", q.outcome === "right" && "text-primary")}>{title}</span>
          {!waiting && q.correct && (
            <span className="block text-xs text-muted-foreground">
              جواب درست: {word(q.correct)}
              {q.myAnswer ? ` • تو گفتی ${word(q.myAnswer)}` : ""}
            </span>
          )}
        </p>
      </div>
    </Panel>
  );
}

/** The live question on the backend: the card while one is open, its result once it closes, your tally under it. Your answer also earns XP through the gamification server. */
export function RealLiveQuestion({ matchId, kickoffAt }: { matchId: string; kickoffAt: string }) {
  const { data: q } = useCurrentQuestion(matchId);
  const mine = useLiveMemory((m) => m.byMatch[matchId]);
  // the fallback is for a question the server no longer shows (or replaced)
  const orphan = mine && (!q || q.id !== mine.id) ? mine : undefined;
  const statsQuery = useLiveStats(matchId, !!orphan);
  const stats = statsQuery.data;
  const clock = statsQuery.dataUpdatedAt;

  const fallback = orphan
    ? ({
        kind: stats && stats.right > orphan.rightBefore ? "done" : clock - orphan.at > RESULT_WAIT_MS ? "done" : "waiting",
        id: orphan.id,
        index: orphan.index,
        total: orphan.total,
        text: orphan.text,
        myAnswer: orphan.myAnswer,
        correct: null,
        outcome: stats && stats.right > orphan.rightBefore ? "right" : null,
      } as const)
    : null;

  return (
    <>
      {q?.kind === "open" ? (
        <>
          <OpenCard key={q.id} matchId={matchId} kickoffAt={kickoffAt} q={q} rightNow={stats?.right ?? 0} clock={clock} />
          <ComboMeter />
        </>
      ) : q ? (
        <>
          <ResultCard key={q.id} q={q} />
          <ComboMeter />
        </>
      ) : fallback ? (
        <>
          <ResultCard key={fallback.id} q={fallback} />
          <ComboMeter />
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">الان سؤالی باز نیست. سؤال بعدی که اومد همین‌جا ظاهر میشه.</p>
      )}
      {q?.kind === "open" && fallback && <ResultCard key={`prev-${fallback.id}`} q={fallback} />}
      {stats && stats.calls > 0 && (
        <p className="text-center text-xs text-muted-foreground" aria-live="polite">
          <span className="font-display text-sm font-bold text-foreground">{formatNumber(stats.right)}</span> از{" "}
          <span className="font-display text-sm font-bold text-foreground">{formatNumber(stats.calls)}</span> درست •{" "}
          <span className="font-display text-sm font-bold text-primary">{formatNumber(stats.points)}</span> امتیاز
        </p>
      )}
    </>
  );
}
