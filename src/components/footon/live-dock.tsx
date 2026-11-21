"use client";

import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";

import { Dock } from "@/components/footon/dock";
import { getJson } from "@/lib/api/get";
import { Fixtures, dateKey } from "@/lib/football/fixtures";
import { useChallenges } from "@/lib/slips/challenges";

const noop = () => () => {};

/** The dock on backend data: the Live tab's dot while a match is on, the pending-invite count on Challenges. */
export function LiveDock() {
  const today = useSyncExternalStore(noop, () => dateKey(new Date()), () => null);
  const { invites } = useChallenges(today);
  const live = useQuery({ queryKey: ["football", "live"], queryFn: () => getJson("football/fixtures/live", Fixtures), refetchInterval: 30_000 });
  return <Dock live={(live.data?.length ?? 0) > 0} invites={invites.length} />;
}
