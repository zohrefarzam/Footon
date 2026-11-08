"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CalendarRange, Check, ChevronRight, CircleDot, Leaf, ListChecks, Swords, Users, UsersRound, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Coin } from "@/components/footon/coin";
import { SectionHeading } from "@/components/footon/section-heading";
import { Card, CardRow } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatTimeLeft } from "@/lib/gamification/format";
import { useQuests } from "@/lib/gamification/queries";
import type { FeatureId, Quest } from "@/lib/gamification/schemas";
import { copy } from "@/lib/gamification/strings";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { CelebrationToast } from "./celebration-toast";
import { XpTrack } from "./level-progress-bar";
import { LockedFeatureGate } from "./locked-feature-gate";

/** Each kind of quest has its own shape. */
const DAILY_ICON: Record<NonNullable<Quest["difficulty"]>, LucideIcon> = { easy: CircleDot, social: Users, challenge: Swords };
const KIND_ICON: Record<Quest["kind"], LucideIcon> = { daily: CircleDot, weekly: CalendarRange, seasonal: Leaf, group: UsersRound };

function QuestIcon({ quest: q }: { quest: Pick<Quest, "kind" | "difficulty"> }) {
  const Icon = q.kind === "daily" && q.difficulty ? DAILY_ICON[q.difficulty] : KIND_ICON[q.kind];
  return <Icon className="size-4" strokeWidth={2.2} />;
}

function timeLeft(q: Quest, serverNow: string) {
  const left = formatTimeLeft(Date.parse(q.expiresAt) - Date.parse(serverNow));
  return q.kind === "daily" || q.kind === "weekly" ? copy.resetsIn(left) : copy.endsIn(left);
}

/**
 * One quest as a row inside a list card: what to do, how far along (neutral
 * track + display numbers), and what it pays (XP neutral, coins amber). Done
 * rows go quiet with a soft-lime check that pops in once.
 */
export function QuestCard({ quest: q, serverNow }: { quest: Quest; serverNow: string }) {
  const reduce = useReducedMotion();
  const label = q.difficulty ? copy.questDifficulty[q.difficulty] : copy.questKind[q.kind];

  return (
    <CardRow aria-label={copy.questAria(q.title, q.progress, q.target, q.completed)} data-quest={q.id} className="items-start">
      <span
        aria-hidden="true"
        className={cn("relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm", q.completed ? "bg-primary-soft text-primary" : "bg-surface-3 text-foreground")}
      >
        {q.completed ? (
          <motion.span
            key="done"
            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <Check className="size-4" strokeWidth={2.6} />
          </motion.span>
        ) : (
          <QuestIcon quest={q} />
        )}
      </span>
      <div aria-hidden="true" className="min-w-0 flex-1">
        <p className={cn("text-[15px] leading-snug font-semibold", q.completed && "text-muted-foreground")}>{q.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {label} · {q.completed ? copy.questDone : timeLeft(q, serverNow)}
        </p>
        {!q.completed && (
          <div className="mt-2 flex items-center gap-2.5">
            <XpTrack pct={q.progress / q.target} className="flex-1" />
            <span className="shrink-0 font-display text-sm font-bold">
              {formatNumber(q.progress)}
              <span className="text-muted-foreground">/{formatNumber(q.target)}</span>
            </span>
          </div>
        )}
      </div>
      <div aria-hidden="true" className={cn("flex shrink-0 flex-col items-end gap-0.5", q.completed && "opacity-60")}>
        <span className="font-display text-[15px] leading-none font-bold">+{formatNumber(q.reward.xp)} XP</span>
        <span className="inline-flex items-center gap-1 font-display text-[15px] leading-none font-bold text-live">
          <Coin className="size-3.5 text-[7px]" />
          {formatNumber(q.reward.coins)}
        </span>
      </div>
    </CardRow>
  );
}

/**
 * Quests of some kinds as one divided card. Expired quests never show: the
 * server just stops sending them (no message, no penalty). With `feature`,
 * the list sits behind its unlock level and shows locked until then.
 */
export function QuestList({ kinds, title, feature, className }: { kinds: Quest["kind"][]; title: string; feature?: FeatureId; className?: string }) {
  const board = useQuests().data;
  const quests = board?.quests.filter((q) => kinds.includes(q.kind)) ?? [];
  const done = quests.filter((q) => q.completed).length;
  const viewed = useRef(false);

  useEffect(() => {
    if (!board || viewed.current || quests.length === 0) return;
    viewed.current = true;
    track("quest_list_viewed", { count: quests.length });
  }, [board, quests.length]);

  const list = board ? (
    <Card className="overflow-hidden">
      {quests.map((q) => (
        <QuestCard key={q.id} quest={q} serverNow={board.serverNow} />
      ))}
    </Card>
  ) : (
    <Skeleton className="h-[150px] rounded-xl" />
  );

  if (board && quests.length === 0 && !feature) return null;

  return (
    <section aria-labelledby={`quests-${kinds.join("-")}`} className={cn("flex flex-col gap-2.5", className)}>
      <SectionHeading
        id={`quests-${kinds.join("-")}`}
        title={title}
        meta={board && quests.length > 0 ? <span className="ms-auto text-xs text-muted-foreground">{copy.doneOf(done, quests.length)}</span> : undefined}
      />
      {feature ? (
        <LockedFeatureGate feature={feature} variant="row" title={copy.weeklyQuests} className="rounded-xl border border-dashed border-line-strong">
          {list}
        </LockedFeatureGate>
      ) : (
        list
      )}
    </section>
  );
}

/**
 * Home's one line about quests: today's "N of M done" and the next open daily
 * quest with its track, linking to /quests. All done → a soft-lime check.
 * Keeps Home short; the lists live on /quests.
 */
export function QuestsTile({ className }: { className?: string }) {
  const board = useQuests().data;
  if (!board) return <Skeleton className={cn("h-[66px] rounded-xl", className)} />;

  const daily = board.quests.filter((q) => q.kind === "daily");
  const done = daily.filter((q) => q.completed).length;
  const next = daily.find((q) => !q.completed);
  const label = next
    ? `${copy.questsTitle}, ${copy.doneOf(done, daily.length)}. ${copy.next}: ${copy.questAria(next.title, next.progress, next.target, false)}`
    : `${copy.questsTitle}, ${copy.allDoneToday}`;

  return (
    <Link
      href="/quests"
      aria-label={label}
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 outline-none transition-[transform,background-color] duration-200 ease-spring hover:bg-surface-hover focus-visible:ring-[3px] focus-visible:ring-ring/60 active:scale-[0.98]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("flex size-10 shrink-0 items-center justify-center rounded-sm", next ? "bg-surface-3 text-foreground" : "bg-primary-soft text-primary")}
      >
        {next ? <ListChecks className="size-[18px]" strokeWidth={2.2} /> : <Check className="size-[18px]" strokeWidth={2.6} />}
      </span>
      <span aria-hidden="true" className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold">{copy.questsTitle}</span>
          <span className="text-xs text-muted-foreground">{copy.doneOf(done, daily.length)}</span>
        </span>
        {next ? (
          <span className="mt-1 flex items-center gap-2.5">
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{next.title}</span>
            <XpTrack pct={next.progress / next.target} className="w-14 shrink-0" />
            <span className="shrink-0 font-display text-[13px] font-bold">
              {formatNumber(next.progress)}
              <span className="text-muted-foreground">/{formatNumber(next.target)}</span>
            </span>
          </span>
        ) : (
          <span className="mt-0.5 block text-xs text-muted-foreground">{copy.allDoneToday}</span>
        )}
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-spring group-hover:translate-x-0.5 rtl:rotate-180"
        aria-hidden="true"
      />
    </Link>
  );
}

/** A quest just finished: short, soft-lime check (it's a win), what it paid. */
export function QuestToast({ title, reward, onDismiss }: { title: string; reward?: { xp: number; coins: number }; onDismiss: () => void }) {
  return (
    <CelebrationToast
      tone="win"
      icon={<Check className="size-5" strokeWidth={2.6} />}
      eyebrow={copy.questDoneEyebrow}
      title={title}
      detail={reward ? copy.questReward(reward.xp, reward.coins) : undefined}
      onDismiss={onDismiss}
      dismissLabel={copy.skip}
    />
  );
}
