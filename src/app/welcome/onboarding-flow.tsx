"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, ChevronLeft, X } from "lucide-react";

import { Coin, CoinBadge } from "@/components/footon/coin";
import { NumberTicker } from "@/components/footon/number-ticker";
import { useSplashDone } from "@/components/footon/splash-gate";
import { TeamCrest } from "@/components/footon/team-crest";
import { Button } from "@/components/ui/button";
import type { Team } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { formatMinute, formatNumber, formatPercent, formatSigned } from "@/lib/format";

type Sample = {
  match: string;
  minute: number;
  text: string;
  yesShare: number;
  outcome: "yes" | "no";
  resolvedLabel: string;
  reward: number;
};

export type OnboardingData = {
  startingCoins: number;
  sample: Sample;
  /** The next starter missions and what each pays. */
  steps: { title: string; coins: number }[];
  clubs: Team[];
};

const STEPS = 3;
const spring = { type: "spring", stiffness: 380, damping: 30 } as const;

/** Read by `src/proxy.ts`: once set, `/` stops redirecting here. */
function markOnboarded() {
  document.cookie = "footon_onboarded=1; path=/; max-age=31536000; samesite=lax";
}

export function OnboardingFlow({ data }: { data: OnboardingData }) {
  const ready = useSplashDone();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [clubs, setClubs] = useState<string[]>([]);
  const [claimed, setClaimed] = useState(false);
  const router = useRouter();
  const reduce = useReducedMotion();

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const claim = () => {
    setClaimed(true);
    markOnboarded();
    setTimeout(() => router.replace("/"), reduce ? 300 : 1500);
  };

  // right to left: the next step comes in from the left (the reading direction), the last one leaves to the right
  const slide = {
    enter: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: -28 * d, filter: "blur(6px)" }),
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: 28 * d, filter: "blur(6px)" }),
  };

  return (
    <>
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-5 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
        {/* top bar: back • progress • wallet */}
        <header className="grid h-11 grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex">
            <AnimatePresence initial={false}>
              {step > 0 && !claimed && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                  <Button variant="ghost" size="icon-sm" aria-label="مرحلهٔ قبل" onClick={() => go(step - 1)}>
                    <ChevronLeft className="rtl:rotate-180" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ol className="flex items-center gap-1.5" aria-label={`مرحلهٔ ${formatNumber(step + 1)} از ${formatNumber(STEPS)}`}>
            {Array.from({ length: STEPS }, (_, i) => (
              <motion.li
                key={i}
                aria-current={i === step ? "step" : undefined}
                animate={{ width: i === step ? 32 : 16 }}
                transition={spring}
                className={cn(
                  "h-1 rounded-full transition-colors duration-300",
                  i === step ? "bg-primary" : i < step ? "bg-primary-line" : "bg-surface-3",
                )}
              />
            ))}
          </ol>
          <div className="flex justify-end">
            <CoinBadge value={claimed ? data.startingCoins : 0} animate className="shrink-0" />
          </div>
        </header>

        {!ready && <div className="flex-1" />}
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          {ready && (
            <motion.div
              key={step}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex flex-1 flex-col"
            >
              {step === 0 && <TryStep sample={data.sample} answer={answer} onAnswer={setAnswer} />}
              {step === 1 && (
                <ClubsStep
                  clubs={data.clubs}
                  selected={clubs}
                  onToggle={(code) => setClubs((s) => (s.includes(code) ? s.filter((c) => c !== code) : [...s, code]))}
                />
              )}
              {step === 2 && <ClaimStep coins={data.startingCoins} steps={data.steps} claimed={claimed} />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* footer: one action per step */}
        <footer className="mt-6 flex flex-col items-center gap-4">
          {step === 0 &&
            (answer ? (
              <ArrowCta onClick={() => go(1)}>ادامه</ArrowCta>
            ) : (
              <Button variant="secondary" size="lg" className="w-full" onClick={() => go(1)}>
                ادامه
              </Button>
            ))}
          {step === 1 && (
            <ArrowCta onClick={() => go(2)}>
              {clubs.length ? `دنبال کردن ${formatNumber(clubs.length)} باشگاه` : "ادامه"}
            </ArrowCta>
          )}
          {step === 2 && (
            <ArrowCta onClick={claim} disabled={claimed} done={claimed}>
              {claimed ? "سکه‌ها گرفته شد" : `گرفتن ${formatNumber(data.startingCoins)} سکه`}
            </ArrowCta>
          )}
          <p className="text-[13px] text-muted-foreground">
            قبلاً اینجا بودی؟{" "}
            <Link
              href="/"
              prefetch={false}
              replace
              onClick={markOnboarded}
              className="rounded-sm font-semibold text-foreground underline decoration-ring underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-[3px] focus-visible:ring-ring/60"
            >
              برو به خانه
            </Link>
          </p>
        </footer>
      </div>
    </>
  );
}

/** Screen CTA: lime, label at the start, dark inset square with an arrow at the end. */
function ArrowCta({
  children,
  onClick,
  disabled,
  done,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  done?: boolean;
}) {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Button size="lg" onClick={onClick} disabled={disabled} className="w-full justify-between ps-5 pe-2 font-bold disabled:opacity-100">
        <span aria-live="polite">{children}</span>
        <span className="flex size-10 items-center justify-center rounded-[10px] bg-primary-foreground text-primary">
          {done ? <Check className="size-[18px]" strokeWidth={2.6} /> : <ArrowRight className="size-[18px] rtl:rotate-180" strokeWidth={2.4} />}
        </span>
      </Button>
    </motion.div>
  );
}

function Headline({ title, sub }: { title: string; sub: string }) {
  return (
    <h1 className="text-[30px] leading-[1.35] font-extrabold text-balance">
      {title}
      <br />
      <span className="text-muted-foreground">{sub}</span>
    </h1>
  );
}

/* ---------- Step 1: answer one real question ---------- */

function TryStep({ sample, answer, onAnswer }: { sample: Sample; answer: "yes" | "no" | null; onAnswer: (a: "yes" | "no") => void }) {
  const [resolved, setResolved] = useState(answer !== null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!answer || resolved) return;
    const t = setTimeout(() => setResolved(true), 1800);
    return () => clearTimeout(t);
  }, [answer, resolved]);

  const right = answer === sample.outcome;

  return (
    <div className="flex flex-1 flex-col">
      {/* the dealt stack, on a dotted canvas that fades at the edges */}
      <div className="relative -mx-5 flex flex-1 items-center justify-center px-8 py-8">
        <div
          aria-hidden="true"
          className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_72%)]"
        />
        <div className="relative w-full max-w-[300px]">
          <motion.div
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0, rotate: 0, y: 30 }}
            animate={{ opacity: 1, rotate: 7, y: 6, x: 14 }}
            transition={{ ...spring, delay: 0.05 }}
            className="absolute inset-0 rounded-2xl border border-line bg-surface p-4"
          >
            <p className="text-[11px] font-semibold tracking-[0.08em] text-subtle">سؤال {formatNumber(7)}</p>
            <p className="mt-2 text-[22px] font-bold tracking-[-0.03em] text-[#2c4d3f]">گل قبل از دقیقهٔ ۸۰؟</p>
          </motion.div>
          <motion.div
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0, rotate: 0, y: 30 }}
            animate={{ opacity: 1, rotate: -5, y: 2, x: -12 }}
            transition={{ ...spring, delay: 0.12 }}
            className="absolute inset-0 rounded-2xl border border-surface-3 bg-surface-hover"
          />

          <motion.section
            aria-label="سؤال نمونه"
            initial={reduce ? false : { opacity: 0, y: 40, rotate: 3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="relative flex min-h-[220px] flex-col rounded-2xl border border-line-raised bg-surface-2 p-4 shadow-[0_24px_48px_-20px_rgb(0_0_0/0.9)]"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-live">
                <span className="size-1.5 rounded-full bg-live animate-live-pulse" aria-hidden="true" />
                امتحان کن
              </span>
              <span className="font-display text-[15px] font-bold tracking-wide text-muted-foreground uppercase">
                {sample.match} • <span className="text-live">{formatMinute(sample.minute)}</span>
              </span>
            </div>
            <h2 className="mt-3 text-[24px] leading-[1.4] font-bold text-balance">{sample.text}</h2>

            <div className="mt-auto pt-5">
              <AnimatePresence mode="wait" initial={false}>
                {!answer ? (
                  <motion.div key="ask" exit={{ opacity: 0, y: 6, filter: "blur(4px)" }} className="grid grid-cols-2 gap-2">
                    <Button size="lg" className="h-12 text-base font-bold" onClick={() => onAnswer("yes")}>
                      بله
                    </Button>
                    <Button size="lg" variant="secondary" className="h-12 text-base font-bold" onClick={() => onAnswer("no")}>
                      نه
                    </Button>
                  </motion.div>
                ) : !resolved ? (
                  <motion.div
                    key="split"
                    initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                    className="flex flex-col gap-2.5"
                    aria-live="polite"
                  >
                    <div className="flex justify-between text-[13px] font-semibold">
                      <span>بله {formatPercent(sample.yesShare)}</span>
                      <span className="text-muted-foreground">{formatPercent(100 - sample.yesShare)} نه</span>
                    </div>
                    <div className="flex h-2 gap-[3px]">
                      {(["yes", "no"] as const).map((side) => (
                        <motion.div
                          key={side}
                          initial={{ width: 0 }}
                          animate={{ width: `${side === "yes" ? sample.yesShare : 100 - sample.yesShare}%` }}
                          transition={{ type: "spring", stiffness: 120, damping: 18 }}
                          className={cn("rounded-full", answer === side ? "bg-primary" : "bg-dim")}
                        />
                      ))}
                    </div>
                    <p className="text-shimmer text-[13px] font-medium">در انتظار دقیقهٔ ۷۵…</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={spring}
                    className={cn(
                      "flex items-center gap-3 rounded-md border px-3 py-2.5",
                      right ? "border-primary-line bg-primary-soft" : "border-loss/30 bg-loss-soft",
                    )}
                    aria-live="polite"
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        right ? "bg-primary text-primary-foreground" : "border-2 border-loss text-loss",
                      )}
                    >
                      {right ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <motion.path
                            d="M5 12.5l4.5 4.5L19 7"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.45, delay: 0.1, ease: [0.65, 0, 0.35, 1] }}
                          />
                        </svg>
                      ) : (
                        <X className="size-4" strokeWidth={3} aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[15px] font-semibold", right ? "text-primary" : "text-loss")}>
                        {right ? "درست گفتی." : "این بار نه."}
                      </p>
                      <p className="text-xs text-muted-foreground">{sample.resolvedLabel}</p>
                    </div>
                    {right && (
                      <span className="font-display text-[22px] font-bold text-primary">
                        {formatSigned(sample.reward)}
                        <span className="ms-0.5 text-sm">امتیاز</span>
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </div>

      <Headline title="لحظهٔ بعدی را پیش‌بینی کن." sub="زودتر از دوستانت." />
      <p className="mt-3 text-[15px] text-muted-foreground">
        {resolved
          ? right
            ? `توی یه بازی واقعی این میشه ${formatSigned(sample.reward)} امتیاز. امتیاز رتبه‌ات را می‌سازه؛ سکه راهت میده توی لیگ‌ها.`
            : "بعدی را می‌گیری. همیشه یه بعدی هست."
          : "رایگانه. برای شروع لازم نیست ثبت‌نام کنی."}
      </p>
    </div>
  );
}

/* ---------- Step 2: pick clubs ---------- */

function ClubsStep({ clubs, selected, onToggle }: { clubs: Team[]; selected: string[]; onToggle: (code: string) => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col pt-6">
      <Headline title="طرفدار کدام تیمی؟" sub="بازی‌هاشون اول میاد." />
      <p className="mt-3 text-[15px] text-muted-foreground">هر چندتا دوست داری انتخاب کن. هر وقت خواستی می‌تونی عوضشون کنی.</p>

      <ul className="mt-6 grid grid-cols-4 gap-2" aria-label="باشگاه‌ها">
        {clubs.map((club, i) => {
          const on = selected.includes(club.code);
          return (
            <motion.li
              key={club.code}
              initial={reduce ? false : { opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...spring, delay: 0.04 * i }}
            >
              <button
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(club.code)}
                className={cn(
                  "relative flex w-full flex-col items-center gap-2 rounded-xl border px-1 pt-3.5 pb-2.5 outline-none transition-[transform,background-color,border-color] duration-200 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60",
                  on ? "border-primary-line bg-primary-soft" : "border-line bg-surface hover:bg-surface-hover",
                )}
              >
                <TeamCrest code={club.code} colors={club.colors} size="lg" />
                <span className={cn("w-full truncate text-center text-xs font-medium", on ? "text-primary" : "text-muted-foreground")}>
                  {club.name}
                </span>
                <AnimatePresence>
                  {on && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 24 }}
                      className="absolute -top-1.5 -end-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background"
                      aria-hidden="true"
                    >
                      <Check className="size-3" strokeWidth={3.2} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Step 3: claim the starting stack ---------- */

function ClaimStep({ coins, steps, claimed }: { coins: number; steps: { title: string; coins: number }[]; claimed: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative -mx-5 flex flex-1 flex-col items-center justify-center py-8">
        <div
          aria-hidden="true"
          className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
        />
        {/* a short stack of coins, dealt from below */}
        <div className="relative h-[132px] w-[132px]" aria-hidden="true">
          {[2, 1, 0].map((n) => (
            <motion.span
              key={n}
              initial={reduce ? false : { opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: -n * 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.08 * (2 - n) }}
              className="absolute inset-x-0 bottom-0 h-7 rounded-[50%] border border-[#b77a1c] bg-[#e09a2e]"
            />
          ))}
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 70, rotateX: 50 }}
            animate={claimed && !reduce ? { opacity: 1, y: [-30, -54, -30], rotateY: [0, 360] } : { opacity: 1, y: -30, rotateX: 0 }}
            transition={claimed ? { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] } : { type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
            className="absolute inset-x-0 bottom-0 flex aspect-square items-center justify-center rounded-full bg-live font-display text-[64px] font-bold text-live-foreground shadow-[inset_0_-6px_0_rgb(0_0_0/0.22),inset_0_0_0_8px_rgb(255_255_255/0.14),0_20px_40px_-16px_rgb(0_0_0/0.9)]"
          >
            ف
          </motion.span>
        </div>
        <p className="relative mt-7 font-display text-[64px] leading-none font-bold text-live">
          <NumberTicker value={coins} duration={1.4} />
        </p>
        <p className="relative mt-1 text-[13px] font-medium text-muted-foreground">اولین مأموریت: باشگاه‌هایت را انتخاب کردی</p>
      </div>

      <Headline title="اولین سکه‌هایت." sub="تا آخر هفته کلی سکهٔ دیگه هم داری." />

      <ol className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
        {steps.map((s, i) => (
          <li key={s.title}>
            <span className={cn("font-display text-base font-bold", i === 0 ? "text-primary" : "text-muted-foreground")}>
              {formatNumber(i + 1).padStart(2, "۰")}
            </span>
            <p className="mt-0.5 text-sm font-semibold">{s.title}</p>
            <p className="mt-0.5 flex items-center gap-1 font-display text-[15px] font-bold text-live">
              {formatSigned(s.coins)}
              <Coin className="size-3.5 text-[7px]" />
              <span className="sr-only">سکه</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
