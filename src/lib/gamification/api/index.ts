import { kickoffISO } from "@/lib/dates";
import { matches, mockToday } from "@/lib/mock-data";
import { createHttpApi, validated, type GamificationApi } from "./client";
import { createMockApi, type MockGamificationApi } from "./mock";

/**
 * The app's gamification API. Set `NEXT_PUBLIC_GAMIFICATION_API` to the
 * backend's base URL to use it; otherwise the in-memory mock runs, living in
 * the mock world's "today" so its streak days line up with the fixtures.
 */
const base = process.env.NEXT_PUBLIC_GAMIFICATION_API;

function mockNow() {
  const t = new Date();
  return new Date(`${mockToday}T${t.toISOString().slice(11)}`);
}

export const mockApi: MockGamificationApi | null = base
  ? null
  : createMockApi({
      fixtures: matches.map((m) => ({ kickoff: kickoffISO(m) })),
      initial: { streak: { current: 3, best: 6, lastDayKey: "2026-11-02", freezesHeld: 1, status: "active" } },
      now: mockNow,
    });

export const api: GamificationApi = validated(mockApi ?? createHttpApi(base!));
