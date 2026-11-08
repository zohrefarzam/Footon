import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockApi } from "./api/mock";
import { celebrations } from "./celebrations/store";
import { bindOutbox, createOutbox } from "./outbox";
import { gamificationKeys } from "./queries";

vi.mock("./api", () => ({ api: {}, mockApi: null }));

const now = () => new Date("2026-11-03T18:00:00Z");
const input = (key: string) => ({ idempotencyKey: key, matchId: "m1", kickoff: "2026-11-03T20:00:00Z", count: 1, timeZone: "UTC" });

describe("outbox", () => {
  let qc: QueryClient;
  beforeEach(async () => {
    localStorage.clear();
    celebrations.getState().clear();
    qc = new QueryClient();
    bindOutbox(qc);
  });

  async function seed(api: ReturnType<typeof createMockApi>) {
    qc.setQueryData(gamificationKeys.progress, await api.getProgress());
  }

  it("keeps a failed prediction retryable and shows no reward until the server answers", async () => {
    const server = createMockApi({ latencyMs: 0, now });
    await seed(server);
    const box = createOutbox(server);
    server.dev.setOffline(true);

    await box.getState().send({ kind: "prediction", input: input("k1") });
    expect(box.getState().entries.k1.status).toBe("failed");
    expect(qc.getQueryData<{ totalXp: number }>(gamificationKeys.progress)?.totalXp).toBe(1640); // no ghost XP
    expect(celebrations.getState().current).toBeNull();
    expect(JSON.parse(localStorage.getItem("footon_outbox")!)).toHaveLength(1); // survives a reload

    server.dev.setOffline(false);
    await box.getState().retryFailed();
    expect(box.getState().entries.k1.status).toBe("sent");
    expect(qc.getQueryData<{ totalXp: number }>(gamificationKeys.progress)?.totalXp).toBe(1660); // the server's number
    expect(celebrations.getState().current?.kind).toBe("xp");
  });

  it("retries with the same key, so the server rewards once", async () => {
    const server = createMockApi({ latencyMs: 0, now });
    await seed(server);
    const spy = vi.spyOn(server, "submitPrediction");
    const box = createOutbox(server);
    server.dev.failNext("server");
    await box.getState().send({ kind: "prediction", input: input("k1") });
    await box.getState().retry("k1");
    await box.getState().retry("k1"); // already sent: no-op
    expect(spy.mock.calls.map((c) => c[0].idempotencyKey)).toEqual(["k1", "k1"]);
    expect(server.dev.state().totalXp).toBe(1660);
  });

  it("ignores a double submit while the first is in flight", async () => {
    const server = createMockApi({ latencyMs: 20, now });
    await seed(server);
    const spy = vi.spyOn(server, "submitPrediction");
    const box = createOutbox(server);
    await Promise.all([box.getState().send({ kind: "prediction", input: input("k1") }), box.getState().send({ kind: "prediction", input: input("k1") })]);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
