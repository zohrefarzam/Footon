"use client";

import { useSyncExternalStore } from "react";

import { BoostBadge } from "@/components/footon/boost-badge";
import { EmptyState } from "@/components/footon/empty-state";
import { MatchRow } from "@/components/footon/match-row";
import { SectionHeading } from "@/components/footon/section-heading";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dateKey } from "@/lib/football/fixtures";
import { useBigMatches } from "@/lib/slips/api";
import { toServiceMatch } from "@/lib/slips/match";

const noop = () => () => {};

/** Home's "big matches" card on the backend: open matches whose wins pay 2x. */
export function HomeBigFixtures() {
  const today = useSyncExternalStore(noop, () => dateKey(new Date()), () => null);
  const { data, isPending, isError } = useBigMatches(today);

  if (isPending && !isError) return <Skeleton className="h-40 w-full rounded-2xl" />;
  if (!data?.length) return <EmptyState title="فعلاً بازی بزرگی نیست" body="همهٔ بازی‌ها توی بخش زنده‌ست. یکی را انتخاب کن و پیش‌بینی‌ات را بکن." action={{ label: "دیدن بازی‌ها", href: "/live" }} />;

  return (
    <Card className="overflow-hidden">
      <section aria-labelledby="home-big">
        <SectionHeading
          id="home-big"
          title="بازی‌های بزرگ"
          meta={<BoostBadge label="بردها" className="max-[359px]:hidden" />}
          action={{ label: "همهٔ بازی‌ها", href: "/live" }}
          className="border-b border-line ps-4 pe-3 pt-3.5 pb-3"
        />
        {data.map((m) => (
          <MatchRow key={m.id} match={toServiceMatch(m, today!, true)} showBoost={false} href={`/match/${m.id}`} />
        ))}
      </section>
    </Card>
  );
}
