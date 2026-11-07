/**
 * Prediction types a player can set on a match before kickoff. Each one is a
 * single pick from a short list of options; the stake and payout rules live in
 * `economy.ts` (`PREDICTION_MIN_STAKE`, `payout()`).
 */

export const PREDICTION_TYPES = ["score", "result", "goals", "corners", "yellows", "red", "penalty"] as const;
export type PredictionType = (typeof PREDICTION_TYPES)[number];

export type Prediction = {
  id: string;
  type: PredictionType;
  /** The chosen option's value (see `predictionOptions`). Empty = not picked yet. */
  pick: string;
  /** Coins on this prediction. */
  stake: number;
  /** Set once it has resolved. */
  result?: "right" | "wrong";
};

export const PREDICTION_LABELS: Record<PredictionType, string> = {
  score: "Correct score",
  result: "Win / draw",
  goals: "Goals",
  corners: "Corners",
  yellows: "Yellow cards",
  red: "Red card",
  penalty: "Penalty",
};

/** Most goals one side can be called for in a correct-score pick. */
export const SCORE_MAX = 9;

/** "2-1" ⇄ [2, 1]. Correct-score picks are stored as `home-away`. */
export const scorePick = (home: number, away: number) => `${home}-${away}`;
export function parseScore(pick: string): [number, number] | undefined {
  const m = /^(\d)-(\d)$/.exec(pick);
  return m ? [Number(m[1]), Number(m[2])] : undefined;
}

/**
 * The options for one type. Result reads the team names. Correct score has no
 * fixed list: it is picked with the score stepper (`scorePick`).
 */
export function predictionOptions(type: PredictionType, home: string, away: string): { value: string; label: string }[] {
  switch (type) {
    case "score":
      return [];
    case "result":
      return [
        { value: "1", label: home },
        { value: "X", label: "Draw" },
        { value: "2", label: away },
      ];
    case "goals":
      return ["Under 2.5", "Over 2.5", "Over 3.5"].map((v) => ({ value: v, label: v }));
    case "corners":
      return ["Under 9.5", "Over 9.5", "Over 11.5"].map((v) => ({ value: v, label: v }));
    case "yellows":
      return ["Under 3.5", "Over 3.5", "Over 5.5"].map((v) => ({ value: v, label: v }));
    case "red":
    case "penalty":
      return ["Yes", "No"].map((v) => ({ value: v, label: v }));
  }
}

/** "Arsenal win", "Over 2.5 goals", "Red card: Yes": one line for a locked prediction. */
export function predictionSummary(p: Pick<Prediction, "type" | "pick">, home: string, away: string): string {
  if (p.type === "score") {
    const sc = parseScore(p.pick);
    return sc ? `${home} ${sc[0]}–${sc[1]} ${away}` : PREDICTION_LABELS.score;
  }
  const opt = predictionOptions(p.type, home, away).find((o) => o.value === p.pick);
  if (!opt) return PREDICTION_LABELS[p.type];
  switch (p.type) {
    case "result":
      return p.pick === "X" ? "Draw" : `${opt.label} win`;
    case "goals":
    case "corners":
    case "yellows":
      return `${opt.label} ${PREDICTION_LABELS[p.type].toLowerCase()}`;
    default:
      return `${PREDICTION_LABELS[p.type]}: ${opt.label}`;
  }
}
