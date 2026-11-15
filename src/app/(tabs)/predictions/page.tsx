import Link from "next/link";
import { Check, ChevronRight, Pencil, X } from "lucide-react";

import { AppShell } from "@/components/footon/app-shell";
import { BoostBadge } from "@/components/footon/boost-badge";
import { Coin } from "@/components/footon/coin";
import { EmptyState } from "@/components/footon/empty-state";
import { TypeIcon } from "@/components/footon/prediction-builder";
import { SectionHeading } from "@/components/footon/section-heading";
import { TeamCrest } from "@/components/footon/team-crest";
import { Card } from "@/components/ui/card";
import { formatCoins, payout, POINTS_PER_RIGHT_CALL } from "@/lib/economy";
import { matches, predictionSlips, type Match } from "@/lib/mock-data";
import { predictionSummary } from "@/lib/predictions";
import { cn } from "@/lib/utils";
import { formatNumber, formatSigned, matchup } from "@/lib/format";

function Coins({ value, className, coin = "size-3.5 text-[7px]" }: { value: number; className?: string; coin?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 font-display font-bold text-live", className)}>
      {formatCoins(value)}
      <Coin className={coin} />
      <span className="sr-only">سکه</span>
    </span>
  );
}

/**
 * One match on the coupon: a header row (crests, match, when, Edit / open), then its picks as flat
 * rows aligned under the team name. No box per pick: the hairlines carry the grouping.
 */
function Slip({ m, settled = false }: { m: Match; settled?: boolean }) {
  const slip = predictionSlips[m.id];
  const boosted = !!m.boost;
  const when = `${m.day ?? "امروز"} ${m.kickoff ?? ""}`.trim();
  const title = matchup(m.home.name, m.away.name);

  return (
    <li className="[&+&]:border-t [&+&]:border-line">
      <Link
        href={`/match/${m.id}`}
        aria-label={`${title}، ${settled ? "تموم شد، دیدن نتیجه" : `تا ${when} می‌تونی عوضشون کنی، ویرایش`}${boosted && !settled ? "، بردها ۲ برابر" : ""}`}
        className="group flex items-center gap-3 px-4 pt-3.5 pb-2 outline-none transition-colors hover:bg-surface-hover focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/60"
      >
        <span className="flex shrink-0" aria-hidden="true">
          {/* home first (right in RTL) and on top; away tucks in behind it */}
          <TeamCrest code={m.home.code} colors={m.home.colors} size="xs" className="relative z-10 size-[30px]" />
          <TeamCrest code={m.away.code} colors={m.away.colors} size="xs" className="-ms-2.5 size-[30px] opacity-90" />
        </span>
        <span className="min-w-0 flex-1" aria-hidden="true">
          <span className="flex items-center gap-2 text-[15px] font-semibold">
            <span className="truncate max-[359px]:hidden">{title}</span>
            <span className="font-display whitespace-nowrap min-[360px]:hidden">{matchup(m.home.code, m.away.code)}</span>
            {boosted && !settled && <BoostBadge />}
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground">
            {settled && m.score ? (
              <>
                تموم شد
                {/* the two sides as separate items, home first: one text run would flip in RTL */}
                <span className="ms-1 flex items-center gap-1 font-display text-[13px] font-bold text-foreground">
                  <span>{formatNumber(m.score[0])}</span>
                  <span className="text-dim-strong">-</span>
                  <span>{formatNumber(m.score[1])}</span>
                </span>
              </>
            ) : (
              <>
                تا <span className="font-display text-[13px] font-bold text-foreground">{when}</span> عوض‌شدنیه
              </>
            )}
          </span>
        </span>
        {settled ? (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" aria-hidden="true" />
        ) : (
          <span aria-hidden="true" className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-surface-3 px-3 text-xs font-semibold transition-colors group-hover:bg-surface-4 max-[359px]:px-2.5">
            <Pencil className="size-3.5" />
            <span className="max-[359px]:hidden">ویرایش</span>
          </span>
        )}
      </Link>

      <ul aria-label={`پیش‌بینی‌های ${title}`} className="pb-2">
        {slip.map((p) => {
          const right = p.result === "right";
          const wrong = p.result === "wrong";
          const win = payout(p.stake, boosted);
          const summary = predictionSummary(p, m.home.name, m.away.name);
          return (
            <li key={p.id} className="flex min-h-12 items-center gap-3 py-2 ps-4 pe-4">
              {/* start glyph: the type while open; once settled, the outcome by shape (disc ✓ / ring ✗), not just colour */}
              <span className="flex w-[50px] shrink-0 justify-center">
                {right ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Check className="size-4" strokeWidth={2.8} aria-hidden="true" />
                  </span>
                ) : wrong ? (
                  <span className="flex size-7 items-center justify-center rounded-full border border-loss/60 text-loss">
                    <X className="size-3.5" strokeWidth={2.8} aria-hidden="true" />
                  </span>
                ) : (
                  <span className="flex size-7 items-center justify-center rounded-full bg-surface-2">
                    <TypeIcon type={p.type} className="size-3.5 text-muted-foreground" />
                  </span>
                )}
              </span>
              <span className={cn("min-w-0 flex-1 text-sm font-medium", wrong && "text-muted-foreground")}>
                <span className="line-clamp-2">{summary}</span>
                {(right || wrong) && <span className="sr-only">{right ? "، درست" : "، غلط"}</span>}
              </span>
              <span className="flex shrink-0 flex-col items-end gap-0.5 text-end">
                {right ? (
                  <>
                    <span className="font-display text-[15px] leading-none font-bold text-primary">
                      {formatSigned(POINTS_PER_RIGHT_CALL)} <span className="text-xs font-semibold">امتیاز</span>
                    </span>
                    <Coins value={win} className="text-[13px]" />
                  </>
                ) : wrong ? (
                  <span className="font-display text-[15px] leading-none font-bold text-muted-foreground">
                    {formatSigned(-p.stake)}
                    <span className="sr-only"> سکه رفت</span>
                  </span>
                ) : (
                  <>
                    <Coins value={win} className="text-[15px] leading-none" />
                    <span className="text-[11px] text-muted-foreground">
                      با <span className="font-display text-xs font-bold text-foreground">{formatCoins(p.stake)}</span>
                    </span>
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

/**
 * Predictions, its own dock tab: your coupon. One line up top answers the question you open it
 * with (how much can I still win), then open slips (editable until kickoff) and settled ones,
 * each a match header over flat pick rows. Rows open the match's Predict tab.
 */
export default function PredictionsPage() {
  const withSlip = matches.filter((m) => predictionSlips[m.id]?.length);
  const open = withSlip.filter((m) => m.status === "upcoming");
  const settled = withSlip.filter((m) => m.status === "finished");

  const openPicks = open.flatMap((m) => predictionSlips[m.id].map((p) => ({ ...p, boosted: !!m.boost })));
  const staked = openPicks.reduce((s, p) => s + p.stake, 0);
  const couldWin = openPicks.reduce((s, p) => s + payout(p.stake, p.boosted), 0);
  const settledPicks = settled.flatMap((m) => predictionSlips[m.id]);
  const rightCount = settledPicks.filter((p) => p.result === "right").length;

  return (
    <AppShell>
      <h1 className="sr-only">پیش‌بینی‌ها</h1>

      {withSlip.length === 0 ? (
        <EmptyState title="هنوز پیش‌بینی‌ای نداری" body="یه بازی انتخاب کن و قبل از شروعش گل، کرنر یا کارت را پیش‌بینی کن." action={{ label: "دیدن بازی‌ها", href: "/live" }} />
      ) : (
        <>
          {open.length > 0 && (
            // the one bold thing: what you can still win, in one sentence
            <section aria-label="خلاصهٔ پیش‌بینی‌های باز" className="flex items-end justify-between gap-3 border-b border-line pb-4">
              <p className="flex flex-col gap-1">
                <span className="text-[13px] text-muted-foreground">اگه همه درست دربیان</span>
                <span className="flex items-center gap-2">
                  <Coins value={couldWin} className="gap-1.5 text-[40px] leading-none" coin="size-6 text-[11px]" />
                  <span className="text-[15px] font-semibold">می‌بری</span>
                </span>
              </p>
              <p className="pb-1 text-end text-xs leading-relaxed text-muted-foreground">
                <span className="font-display text-sm font-bold text-foreground">{formatNumber(openPicks.length)}</span> پیش‌بینی
                <br />
                <span className="font-display text-sm font-bold text-foreground">{formatCoins(staked)}</span> شرط
              </p>
            </section>
          )}

          {open.length > 0 && (
            <section aria-labelledby="pred-open" className="flex flex-col gap-2.5">
              <SectionHeading id="pred-open" title="باز" meta={<span className="text-xs text-muted-foreground">تا شروع بازی عوض‌شدنیه</span>} />
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
              <SectionHeading
                id="pred-settled"
                title="تموم‌شده"
                meta={
                  <span className="text-xs text-muted-foreground">
                    <span className="font-display text-[13px] font-bold text-foreground">{formatNumber(rightCount)}</span> از{" "}
                    <span className="font-display text-[13px] font-bold text-foreground">{formatNumber(settledPicks.length)}</span> درست
                  </span>
                }
              />
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
            یه بازی دیگه را هم پیش‌بینی کن
            <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </>
      )}
    </AppShell>
  );
}
