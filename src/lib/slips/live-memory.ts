import { create } from "zustand";

/**
 * The last live question you answered on a match, remembered in this tab. The
 * server may stop returning a question as soon as it closes, so this keeps what
 * is needed to say how it went (your tally going up) instead of losing it.
 */
export type AnsweredQuestion = {
  id: string;
  index: number;
  total: number;
  text: string;
  myAnswer: "yes" | "no";
  /** Your right-answer count when you answered. */
  rightBefore: number;
  /** The stats clock (`dataUpdatedAt`) at that moment. */
  at: number;
};

type Memory = { byMatch: Record<string, AnsweredQuestion>; remember(matchId: string, q: AnsweredQuestion): void };

export const useLiveMemory = create<Memory>((set) => ({
  byMatch: {},
  remember: (matchId, q) => set((s) => ({ byMatch: { ...s.byMatch, [matchId]: q } })),
}));

/** How long after answering the tally is still waited on before saying it will show in your stats. */
export const RESULT_WAIT_MS = 90_000;
