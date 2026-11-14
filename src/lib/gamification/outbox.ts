"use client";

import type { QueryClient } from "@tanstack/react-query";
import { createStore, useStore } from "zustand";

import { api } from "./api";
import { ApiError, type LiveAnswerInput, type PredictionInput } from "./api/client";
import { applyReward } from "./queries";

/**
 * Prediction actions on their way to the server. A prediction always feels
 * saved: it's recorded here first, then sent with its idempotency key. If the
 * request fails it stays here as "failed" (kept across reloads) and is retried
 * on reconnect or by tapping Retry, with the SAME key, so the server rewards
 * it once. No reward shows until the server's result arrives.
 */
export type OutboxAction = { kind: "prediction"; input: PredictionInput } | { kind: "liveAnswer"; input: LiveAnswerInput };
export type OutboxStatus = "sending" | "failed" | "sent";
export type OutboxEntry = OutboxAction & { key: string; status: OutboxStatus; error?: string };

type OutboxState = {
  entries: Record<string, OutboxEntry>;
  send(action: OutboxAction): Promise<void>;
  retry(key: string): Promise<void>;
  retryFailed(): Promise<void>;
};

const STORAGE = "luckyfan_outbox";
let queryClient: QueryClient | null = null;

/** The provider hands over its client so results can land in the cache. */
export function bindOutbox(qc: QueryClient) {
  queryClient = qc;
}

function persist(entries: Record<string, OutboxEntry>) {
  try {
    const pending = Object.values(entries).filter((e) => e.status !== "sent");
    localStorage.setItem(STORAGE, JSON.stringify(pending));
  } catch {
    // storage blocked: retry still works for this session
  }
}

function restore(): Record<string, OutboxEntry> {
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(STORAGE);
    const list: OutboxEntry[] = raw ? JSON.parse(raw) : [];
    // anything that was mid-flight when the page closed is failed until retried
    return Object.fromEntries(list.map((e) => [e.key, { ...e, status: "failed" as const }]));
  } catch {
    return {};
  }
}

export function createOutbox(call = api) {
  return createStore<OutboxState>()((set, get) => {
    const update = (key: string, patch: Partial<OutboxEntry>) => {
      const entries = { ...get().entries, [key]: { ...get().entries[key], ...patch } as OutboxEntry };
      set({ entries });
      persist(entries);
    };

    async function run(key: string) {
      const e = get().entries[key];
      if (!e) return;
      update(key, { status: "sending", error: undefined });
      try {
        const result = e.kind === "prediction" ? await call.submitPrediction(e.input) : await call.answerLiveQuestion(e.input);
        update(key, { status: "sent" });
        if (queryClient) applyReward(queryClient, result);
      } catch (err) {
        update(key, { status: "failed", error: err instanceof ApiError ? err.code : "server" });
      }
    }

    return {
      entries: restore(),
      async send(action) {
        const key = action.input.idempotencyKey;
        if (get().entries[key]?.status === "sending") return; // no double submit
        set({ entries: { ...get().entries, [key]: { ...action, key, status: "sending" } } });
        await run(key);
      },
      async retry(key) {
        if (get().entries[key]?.status !== "failed") return;
        await run(key);
      },
      async retryFailed() {
        await Promise.all(
          Object.values(get().entries)
            .filter((e) => e.status === "failed")
            .map((e) => run(e.key)),
        );
      },
    };
  });
}

export const outbox = createOutbox();

export function useOutboxEntry(key: string | null | undefined) {
  return useStore(outbox, (s) => (key ? s.entries[key] : undefined));
}

export function newIdempotencyKey(prefix: string) {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${id}`;
}
