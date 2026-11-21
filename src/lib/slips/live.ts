"use client";

/**
 * The live question and your live stats from the predictions service
 * (`/live/{matchId}/questions/current`, `.../answer`, `/live/{matchId}/me`).
 * The answer also goes to the gamification server for XP and streak, through
 * the existing outbox (see `QuestionCard`'s `reward`).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { getJson } from "@/lib/api/get";
import { ApiError } from "@/lib/gamification/api/client";
import type { LiveQuestion } from "@/components/footon/question-card";

const n = z.coerce.number();

const Question = z.object({
  questionId: z.string(),
  index: n,
  total: n,
  text: z.string(),
  deadlineMinute: n,
  closesAtUtc: z.string(),
  open: z.boolean(),
  status: z.string(),
  myAnswer: z.string().nullish(),
  correctAnswer: z.string().nullish(),
  myOutcome: z.string().nullish(),
  yesShare: n,
});

const yn = (a: string | null | undefined) => (a === "Yes" ? "yes" : a === "No" ? "no" : null);

/**
 * What the live panel shows: the open question, or one that has closed
 * ("waiting" for its result, or "done" with it). `outcome` is how your answer went.
 */
export type CurrentQuestion =
  | { kind: "open"; id: string; question: LiveQuestion; myAnswer: "yes" | "no" | null }
  | { kind: "waiting" | "done"; id: string; index: number; total: number; text: string; myAnswer: "yes" | "no" | null; correct: "yes" | "no" | null; outcome: "right" | "wrong" | "void" | null };

/** The open question, polled; null when none is open (the server answers 204). */
export const useCurrentQuestion = (matchId: string) =>
  useQuery({
    queryKey: ["live", "question", matchId],
    refetchInterval: 5_000,
    queryFn: async (): Promise<CurrentQuestion | null> => {
      const res = await fetch(`/api/predictions/live/${matchId}/questions/current`);
      if (res.status === 204) return null;
      if (!res.ok) throw new ApiError(res.status === 401 ? "unauthorized" : "server", `HTTP ${res.status}`);
      const q = Question.parse(await res.json());
      const myAnswer = yn(q.myAnswer);
      if (!q.open) {
        const done = q.status === "Resolved" || q.status === "Void";
        const outcome = q.myOutcome === "Right" ? "right" : q.myOutcome === "Wrong" ? "wrong" : q.status === "Void" ? "void" : null;
        return { kind: done ? "done" : "waiting", id: q.questionId, index: q.index, total: q.total, text: q.text, myAnswer, correct: yn(q.correctAnswer), outcome };
      }
      return {
        kind: "open",
        id: q.questionId,
        myAnswer,
        question: {
          index: q.index,
          total: q.total,
          text: q.text,
          seconds: Math.max(0, Math.round((Date.parse(q.closesAtUtc) - Date.now()) / 1000)),
          yesShare: q.yesShare,
          resolvesAt: `دقیقهٔ ${q.deadlineMinute}`,
        },
      };
    },
  });

const Me = z.object({ calls: n, right: n, points: n, streak: n });

/** Your tally on this match. `fast` polls quickly while a result is still being waited on. */
export const useLiveStats = (matchId: string, fast = false) =>
  useQuery({ queryKey: ["live", "me", matchId], queryFn: () => getJson(`predictions/live/${matchId}/me`, Me), refetchInterval: fast ? 4_000 : 15_000 });

/** Sends your Yes / No for the question; the question and your stats refresh behind it. */
export function useAnswerQuestion(matchId: string, questionId: string) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async (answer: "yes" | "no") => {
      const res = await fetch(`/api/predictions/live/${matchId}/questions/${questionId}/answer`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answer: answer === "yes" ? "Yes" : "No" }),
      });
      if (!res.ok) throw new ApiError("server", `HTTP ${res.status}`);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["live", "question", matchId] });
      void qc.invalidateQueries({ queryKey: ["live", "me", matchId] });
    },
  });
  return (a: "yes" | "no") => void m.mutateAsync(a).catch(() => {});
}
