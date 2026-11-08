"use client";

import { useEffect, useRef } from "react";
import { CalendarRange, Check, CircleDot, Leaf, Swords, Users, UsersRound, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Coin } from "@/components/footon/coin";
import { Card, CardRow } from "@/components/ui/card";
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

  const list = (
    <Card className="overflow-hidden">
      {board ? quests.map((q) => <QuestCard key={q.id} quest={q} serverNow={board.serverNow} />) : <div aria-busy="true" className="h-[150px]" />}
    </Card>
  );

  if (board && quests.length === 0 && !feature) return null;

  return (
    <section aria-labelledby={`quests-${kinds.join("-")}`} className={cn("flex flex-col gap-2.5", className)}>
      <h2 id={`quests-${kinds.join("-")}`} className="flex items-baseline justify-between text-[13px] font-medium text-muted-foreground">
        {title}
        {board && quests.length > 0 && <span className="text-xs">{copy.doneOf(done, quests.length)}</span>}
      </h2>
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
