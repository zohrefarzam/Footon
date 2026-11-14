import Link from "next/link";
import { Check, ChevronRight, Pencil, X } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { BoostBadge } from "@/components/footon/boost-badge";
import { Coin } from "@/components/footon/coin";
import { EmptyState } from "@/components/footon/empty-state";
import { TypeIcon } from "@/components/footon/prediction-builder";
import { TeamCrest } from "@/components/footon/team-crest";
import { Card } from "@/components/ui/card";
import { formatCoins, payout, POINTS_PER_RIGHT_CALL } from "@/lib/economy";
import { matches, predictionSlips, type Match } from "@/lib/mock-data";
import { predictionSummary } from "@/lib/predictions";
import { cn } from "@/lib/utils";
import { formatNumber, formatScore, formatSigned, matchup } from "@/lib/format";

function Coins({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-display font-bold text-live", className)}>
      {formatCoins(value)}
      <Coin className="size-3.5 text-[7px]" />
      <span className="sr-only">سکه</span>
    </span>
  );
}

/** One match's slip as a group in the list: the match header (opens Predict), then each pick. */
function Slip({ m, settled = false }: { m: Match; settled?: boolean }) {
  const slip = predictionSlips[m.id];
  const boosted = !!m.boost;
  const when = settled ? (m.day ?? "پایان") : `${m.day ?? "امروز"} ${m.kickoff}`;

  return (
    <li className="[&+&]:border-t [&+&]:border-line">
      <Link
        href={`/match/${m.id}`}
        aria-label={`${matchup(m.home.name, m.away.name)}، ${settled ? "تسویه شد" : `ویرایش تا ${when}`}${boosted ? "، بردها ۲ برابر" : ""}`}
        className="flex items-center gap-3 px-4 pt-3.5 pb-2.5 outline-none transition-colors hover:bg-surface-hover focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60"
      >
        <span className="flex shrink-0" aria-hidden="true">
          <TeamCrest code={m.home.code} colors={m.home.colors} size="sm" />
          <TeamCrest code={m.away.code} colors={m.away.colors} size="sm" className="-ms-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[15px] font-semibold">
            <span className="truncate max-[359px]:hidden">
              {matchup(m.home.name, m.away.name)}
            </span>
            <span className="font-display tracking-wide min-[360px]:hidden">
              {matchup(m.home.code, m.away.code)}
            </span>
            {boosted && !settled && <BoostBadge />}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {settled ? (
              <>
                پایان بازی{m.score && <span className="font-display text-[13px] font-bold text-foreground"> {formatScore(m.score[0], m.score[1])}</span>} • {when}
              </>
            ) : (
              <>
                ویرایش تا <span className="font-display text-[13px] font-bold text-foreground">{when}</span>
              </>
            )}
          </span>
        </span>
        {settled ? (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
        ) : (
          <span className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-surface-3 px-3 text-xs font-semibold">
            <Pencil className="size-3.5" aria-hidden="true" />
            ویرایش
          </span>
        )}
      </Link>

      <ul className="flex flex-col gap-1.5 px-4 pb-3.5">
        {slip.map((p) => {
          const right = p.result === "right";
          const wrong = p.result === "wrong";
          return (
            <li
              key={p.id}
              className={cn(
                "flex items-center gap-2.5 rounded-md border px-3 py-2.5",
                right ? "border-primary-line bg-primary-soft" : "border-line bg-surface-2",
              )}
            >
              <TypeIcon type={p.type} className="text-muted-foreground" />
              <span className={cn("min-w-0 flex-1 truncate text-sm font-semibold", wrong && "text-muted-foreground")}>
                {predictionSummary(p, m.home.name, m.away.name)}
              </span>
              {settled ? (
                right ? (
                  <span className="flex shrink-0 items-center gap-2 text-xs">
                    <span className="font-display text-[15px] font-bold text-primary">{formatSigned(POINTS_PER_RIGHT_CALL)} امتیاز</span>
                    <Coins value={payout(p.stake, boosted)} className="text-[15px]" />
                    <Check className="size-4 text-primary" strokeWidth={2.6} aria-label="درست" />
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-display text-[15px] font-bold">{formatSigned(-p.stake)}</span>
                    <X className="size-4 text-loss" strokeWidth={2.6} aria-label="غلط" />
                  </span>
                )
              ) : (
                <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-display text-[15px] font-bold text-foreground">{formatCoins(p.stake)}</span>
                  <span aria-hidden="true">←</span>
                  <span className="sr-only">برد</span>
                  <Coins value={payout(p.stake, boosted)} className="text-[15px]" />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </li>
  );
}

/**
 * Predictions, its own dock tab: every slip you've locked.
 * Open slips (still editable until kickoff) first, with what's staked and what
 * it could win, then settled ones read back ✓ / ✗. Rows open the match's
 * Predict tab, where the builder does the editing.
 */
export default function PredictionsPage() {
  const withSlip = matches.filter((m) => predictionSlips[m.id]?.length);
  const open = withSlip.filter((m) => m.status === "upcoming");
  const settled = withSlip.filter((m) => m.status === "finished");

  const openPicks = open.flatMap((m) => predictionSlips[m.id].map((p) => ({ ...p, boosted: !!m.boost })));
  const staked = openPicks.reduce((s, p) => s + p.stake, 0);
  const couldWin = openPicks.reduce((s, p) => s + payout(p.stake, p.boosted), 0);

  return (
    <AppShell>
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-[26px] font-bold tracking-[-0.03em]">پیش‌بینی‌ها</h1>
        {open.length > 0 && (
          <span className="text-[13px] text-muted-foreground">
            <span className="font-display text-base font-bold text-foreground">{formatNumber(open.length)}</span> بازی باز
          </span>
        )}
      </header>

      {withSlip.length === 0 ? (
        <EmptyState title="هنوز پیش‌بینی‌ای نداری" body="یک بازی انتخاب کن و قبل از شروع، گل‌ها، کرنرها یا کارت‌ها را پیش‌بینی کن." action={{ label: "دیدن بازی‌ها", href: "/live" }} />
      ) : (
        <>
          {open.length > 0 && (
            <Card className="grid grid-cols-3 divide-x divide-line py-3.5 text-center rtl:divide-x-reverse">
              <div className="flex flex-col gap-1 px-2">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">باز</span>
                <span className="font-display text-[28px] leading-none font-bold">{formatNumber(openPicks.length)}</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-2">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">شرط</span>
                <span className="font-display text-[28px] leading-none font-bold">{formatCoins(staked)}</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-2">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">برد احتمالی</span>
                <Coins value={couldWin} className="text-[28px] leading-none" />
              </div>
            </Card>
          )}

          {open.length > 0 && (
            <section aria-labelledby="pred-open" className="flex flex-col gap-2.5">
              <h2 id="pred-open" className="text-[13px] font-medium text-muted-foreground">
                باز • تا شروع بازی قابل ویرایش
              </h2>
              <Card className="overflow-hidden">
                <ul>
                  {open.map((m) => (
                    <Slip key={m.id} m={m} />
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {settled.length > 0 && (
            <section aria-labelledby="pred-settled" className="flex flex-col gap-2.5">
              <h2 id="pred-settled" className="text-[13px] font-medium text-muted-foreground">
                تسویه‌شده
              </h2>
              <Card className="overflow-hidden">
                <ul>
                  {settled.map((m) => (
                    <Slip key={m.id} m={m} settled />
                  ))}
                </ul>
              </Card>
            </section>
          )}

          <Link
            href="/live"
            className="-mt-1 flex h-11 items-center justify-center gap-0.5 self-center rounded-md px-3 text-sm font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
          >
            یک بازی دیگر را پیش‌بینی کن
            <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </>
      )}
    </AppShell>
  );
}
