import type { ZodType } from "zod";

import {
  BadgeCatalog,
  PinResult,
  FeatureFlags,
  GamificationConfig,
  RewardResult,
  UserProgress,
  type FeatureFlags as Flags,
  type GamificationConfig as Config,
  type RewardResult as Reward,
  type UserProgress as Progress,
  type BadgeCatalog as Catalog,
  type PinResult as Pinned,
} from "../schemas";

export type ApiErrorCode = "offline" | "server" | "conflict" | "insufficient_balance" | "invalid_response";

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string = code,
  ) {
    super(message);
    this.name = "ApiError";
  }
  /** Worth retrying with the same idempotency key. */
  get retryable() {
    return this.code === "offline" || this.code === "server";
  }
}

export type PredictionInput = {
  /** Same key on every retry: the server rewards an action once. */
  idempotencyKey: string;
  matchId: string;
  /** Kickoff instant (ISO). The server keys the streak day from it. */
  kickoff: string;
  /** How many predictions were locked in. */
  count: number;
  timeZone: string;
};

export type LiveAnswerInput = {
  idempotencyKey: string;
  matchId: string;
  questionId: string;
  kickoff: string;
  answer: "yes" | "no";
  timeZone: string;
};

/**
 * Everything the client may ask the gamification server. Rewarded actions
 * return a `RewardResult`; the client never computes one.
 */
export interface GamificationApi {
  getConfig(): Promise<Config>;
  getFlags(): Promise<Flags>;
  getProgress(): Promise<Progress>;
  submitPrediction(input: PredictionInput): Promise<Reward>;
  answerLiveQuestion(input: LiveAnswerInput): Promise<Reward>;
  getBadges(): Promise<Catalog>;
  /** Replace the pinned set (max `pinnedBadgesMax`, earned badges only). 409 when it no longer fits. */
  pinBadges(badgeIds: string[]): Promise<Pinned>;
}

function parse<T>(schema: ZodType<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success) throw new ApiError("invalid_response", r.error.message);
  return r.data;
}

/** Wraps any implementation so every response is validated before the UI sees it. */
export function validated(api: GamificationApi): GamificationApi {
  return {
    getConfig: async () => parse(GamificationConfig, await api.getConfig()),
    getFlags: async () => parse(FeatureFlags, await api.getFlags()),
    getProgress: async () => parse(UserProgress, await api.getProgress()),
    submitPrediction: async (i) => parse(RewardResult, await api.submitPrediction(i)),
    answerLiveQuestion: async (i) => parse(RewardResult, await api.answerLiveQuestion(i)),
    getBadges: async () => parse(BadgeCatalog, await api.getBadges()),
    pinBadges: async (ids) => parse(PinResult, await api.pinBadges(ids)),
  };
}

/** The real backend over HTTP. Errors map onto `ApiError` codes. */
export function createHttpApi(baseUrl: string): GamificationApi {
  async function call(path: string, init?: RequestInit & { idempotencyKey?: string }): Promise<unknown> {
    let res: Response;
    try {
      res = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          "content-type": "application/json",
          ...(init?.idempotencyKey ? { "idempotency-key": init.idempotencyKey } : {}),
          ...init?.headers,
        },
      });
    } catch {
      throw new ApiError("offline");
    }
    if (res.status === 409) throw new ApiError("conflict");
    if (res.status === 402) throw new ApiError("insufficient_balance");
    if (!res.ok) throw new ApiError("server", `HTTP ${res.status}`);
    return res.json();
  }
  const post = (path: string, body: { idempotencyKey: string }) =>
    call(path, { method: "POST", body: JSON.stringify(body), idempotencyKey: body.idempotencyKey });

  return {
    getConfig: () => call("/gamification/config") as Promise<Config>,
    getFlags: () => call("/gamification/flags") as Promise<Flags>,
    getProgress: () => call("/me/progress") as Promise<Progress>,
    submitPrediction: (i) => post("/predictions", i) as Promise<Reward>,
    answerLiveQuestion: (i) => post(`/live/${i.matchId}/questions/${i.questionId}/answer`, i) as Promise<Reward>,
    getBadges: () => call("/me/badges") as Promise<Catalog>,
    pinBadges: (badgeIds) => call("/me/badges/pinned", { method: "PUT", body: JSON.stringify({ badgeIds }) }) as Promise<Pinned>,
  };
}
