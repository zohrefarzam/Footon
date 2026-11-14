"use client";

import { useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Direction } from "radix-ui";

import { CelebrationHost } from "@/components/footon/gamification/celebration-host";
import { bindOutbox, outbox } from "@/lib/gamification/outbox";

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  const make = () => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });
  // keep server renders isolated; reuse one cache in the browser
  if (typeof window === "undefined") return make();
  browserQueryClient ??= make();
  return browserQueryClient;
}

/**
 * Client providers for the whole app: right-to-left for every Radix primitive
 * (sliders, tabs, switches read it for direction and arrow keys), the
 * server-state cache (TanStack Query) and the celebration host. Gamification data is fetched in the browser; the
 * launch splash covers the first load.
 */
export function Providers({ children }: { children: ReactNode }) {
  const qc = getQueryClient();

  useEffect(() => {
    bindOutbox(qc);
    // predictions that failed (or were in flight when the page closed) go again
    void outbox.getState().retryFailed();
    const online = () => void outbox.getState().retryFailed();
    window.addEventListener("online", online);
    return () => window.removeEventListener("online", online);
  }, [qc]);

  return (
    <Direction.Provider dir="rtl">
      <QueryClientProvider client={qc}>
        {children}
        <CelebrationHost />
      </QueryClientProvider>
    </Direction.Provider>
  );
}
