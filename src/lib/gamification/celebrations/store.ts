import { createStore, useStore } from "zustand";

import type { Celebration } from "./expand";

/**
 * The celebration queue: UI state only, never XP or coins.
 * - One celebration plays at a time (`current`).
 * - Results arriving quickly are appended in order; nothing is merged or lost.
 * - A result id is played once, so a retried request never celebrates twice.
 * - While paused (splash up, tab hidden) items wait; the one playing finishes.
 */
export type CelebrationState = {
  current: Celebration | null;
  queue: Celebration[];
  paused: boolean;
  /** Result ids already enqueued. */
  seen: Set<string>;
  enqueue(resultId: string, items: Celebration[]): void;
  /** Done with the current one (finished, skipped or closed): play the next. */
  advance(): void;
  setPaused(paused: boolean): void;
  clear(): void;
};

export function createCelebrationStore() {
  return createStore<CelebrationState>()((set, get) => ({
    current: null,
    queue: [],
    paused: false,
    seen: new Set(),
    enqueue(resultId, items) {
      const { seen, queue, current, paused } = get();
      if (seen.has(resultId)) return;
      const nextSeen = new Set(seen).add(resultId);
      const all = [...queue, ...items];
      if (!current && !paused && all.length > 0) set({ seen: nextSeen, current: all[0], queue: all.slice(1) });
      else set({ seen: nextSeen, queue: all });
    },
    advance() {
      const { queue, paused } = get();
      if (paused || queue.length === 0) set({ current: null });
      else set({ current: queue[0], queue: queue.slice(1) });
    },
    setPaused(paused) {
      set({ paused });
      const { current, queue } = get();
      if (!paused && !current && queue.length > 0) set({ current: queue[0], queue: queue.slice(1) });
    },
    clear: () => set({ current: null, queue: [] }),
  }));
}

/** The app's one queue. */
export const celebrations = createCelebrationStore();

export function useCelebrations<T>(selector: (s: CelebrationState) => T): T {
  return useStore(celebrations, selector);
}
