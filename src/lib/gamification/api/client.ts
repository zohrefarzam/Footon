import type { ZodType } from "zod";

import {
  EquipResult,
  MyClub,
  PurchaseResult,
  ShopCatalog,
  QuestBoard,
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
  type QuestBoard as Board,
  type EquipResult as Equipped,
  type MyClub as Club,
  type PurchaseResult as Purchased,
  type ShopCatalog as ShopCat,
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

export type PurchaseInput = {
  itemId: string;
  /** Same key on a retry of the same tap: charged once. */
  idempotencyKey: string;
  /** The free-coin price the user saw; a different server price is a 409, never a surprise charge. */
  price: number;
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
  /** Open quests (daily count per the A/B flag, weekly from its unlock level, seasonal, group). */
  getQuests(): Promise<Board>;
  getShop(): Promise<ShopCat>;
  /** The user has seen the shop: newly unlocked items stop being "New" next time. */
  markShopSeen(): Promise<{ ok: true }>;
  /** 402 insufficient_balance, 409 conflict (price changed, already owned, not unlocked, freezes full). */
  purchase(input: PurchaseInput): Promise<Purchased>;
  equip(itemId: string): Promise<Equipped>;
  /** Your club, or a friend's by id. */
  getMyClub(userId?: string): Promise<Club>;
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
    getQuests: async () => parse(QuestBoard, await api.getQuests()),
    getShop: async () => parse(ShopCatalog, await api.getShop()),
    markShopSeen: () => api.markShopSeen(),
    purchase: async (i) => parse(PurchaseResult, await api.purchase(i)),
    equip: async (id) => parse(EquipResult, await api.equip(id)),
    getMyClub: async (id) => parse(MyClub, await api.getMyClub(id)),
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
    getQuests: () => call("/me/quests") as Promise<Board>,
    getShop: () => call("/shop") as Promise<ShopCat>,
    markShopSeen: () => call("/shop/seen", { method: "POST" }) as Promise<{ ok: true }>,
    purchase: (i) => post("/shop/purchases", i) as Promise<Purchased>,
    equip: (itemId) => call("/me/club/equip", { method: "POST", body: JSON.stringify({ itemId }) }) as Promise<Equipped>,
    getMyClub: (userId) => call(userId ? `/clubs/${userId}` : "/me/club") as Promise<Club>,
  };
}
