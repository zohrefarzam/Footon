"use client";

import { useQuery } from "@tanstack/react-query";

import { getJson as get } from "@/lib/api/get";
import { ActivityPage, EarnRules, MissionsResponse, toWalletData, type WalletData } from "./schemas";

export const useWalletData = () =>
  useQuery<WalletData>({
    queryKey: ["wallet", "screen"],
    queryFn: async () => {
      const [missions, rules, activity] = await Promise.all([
        get("gamification/wallet/missions", MissionsResponse),
        get("gamification/wallet/earn-rules", EarnRules),
        get("wallet/wallet/activity?limit=20", ActivityPage),
      ]);
      return toWalletData(missions, rules, activity);
    },
    staleTime: 30_000,
  });
