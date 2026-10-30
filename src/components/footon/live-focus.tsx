"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import { ArrowUp, Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuestionCard, type LiveQuestion } from "./question-card";

type Member = { name: string; initial: string; you?: boolean };
type Chat = {
  messages: { from: string; initial: string; text: string; you?: boolean }[];
  friendQuestion: { from: string; initial: string; text: string; closes: string };
  reactions: string[];
};

/**
 * Live-match focus layout: one full-height column where the chat always fills
 * what's left. Dragging the chat handle is a single resize gesture: as the chat
 * grows, the match details fold away under the finger, the score moves into the
 * top bar and the question shrinks to a one-row widget. Release springs to the
 * nearer end (flick velocity wins).
 */
export function LiveFocus({
  back,
  title,
  live,
  compactScore,
  details,
  question,
  chat,
  members,
}: {
  /** Top bar: back button, league name, live minute. */
  back: React.ReactNode;
  title: string;
  live: React.ReactNode;
  /** Replaces the title in the top bar once the details have folded away. */
  compactScore: React.ReactNode;
  /** Scoreboard, stats, standings: folds away as the chat grows. */
  details: React.ReactNode;
  question: LiveQuestion;
  chat: Chat;
  members: Member[];
}) {
  const reduce = useReducedMotion();
  const p = useMotionValue(0); // 0 = match view, 1 = chat view
  const detailsRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const [dh, setDh] = useState(0);
  const [chatView, setChatView] = useState(false);
  const start = useRef(0);
  const dragged = useRef(false);

  useEffect(() => {
    const el = detailsRef.current!;
    const ro = new ResizeObserver(() => setDh(el.scrollHeight));
    ro.observe(el);
    threadRef.current!.scrollTop = threadRef.current!.scrollHeight; // newest message in view
    return () => ro.disconnect();
  }, []);

  const height = useTransform(p, (v) => (dh ? dh * (1 - v) : "auto"));
  const detailsOpacity = useTransform(p, [0, 0.5], [1, 0]);
  const detailsScale = useTransform(p, [0, 1], [1, 0.94]);
  const scoreOpacity = useTransform(p, [0.5, 1], [0, 1]);
  const nameOpacity = useTransform(p, [0, 0.5], [1, 0]);
  useMotionValueEvent(p, "change", (v) => setChatView(v > 0.5));

  const snapTo = (to: 0 | 1, velocity = 0) =>
    animate(p, to, reduce ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 36, velocity });

  return (
    <>
      <div className="mb-3.5 flex shrink-0 items-center gap-2.5 px-5">
        {back}
        {/* League name and compact score share the middle slot and crossfade. */}
        <div className="grid flex-1 items-center">
          <motion.span style={{ opacity: nameOpacity }} className="col-start-1 row-start-1 text-[13px] text-muted-foreground">
            {title}
          </motion.span>
          <motion.div style={{ opacity: scoreOpacity }} aria-hidden={!chatView} className="col-start-1 row-start-1">
            {compactScore}
          </motion.div>
        </div>
        {live}
      </div>

      {/* Short screens: the match part scrolls so the chat never loses its peek. */}
      <div className="min-h-0 shrink overflow-y-auto overscroll-contain">
        <motion.div style={{ height }} className="overflow-hidden">
          <motion.div
            ref={detailsRef}
            inert={chatView}
            style={{ opacity: detailsOpacity, scale: detailsScale }}
            className="origin-top px-5 pb-4"
          >
            {details}
          </motion.div>
        </motion.div>

        <div className="px-5">
          <QuestionCard question={question} compact={chatView} />
        </div>
      </div>

      <section aria-label="League chat" className="mx-2 mt-3 flex min-h-[176px] flex-1 flex-col rounded-t-3xl border border-b-0 border-line-strong bg-surface px-3.5">
        <motion.button
          type="button"
          aria-expanded={chatView}
          aria-label={chatView ? "Show match details" : "Expand chat"}
          onPanStart={() => {
            start.current = p.get();
            dragged.current = true;
          }}
          onPan={(_, i) => p.set(Math.min(1, Math.max(0, start.current - i.offset.y / (dh || 1))))}
          onPanEnd={(_, i) => {
            const v = i.velocity.y;
            // Flick wins; otherwise a quarter of the way is enough to switch.
            const moved = p.get() - start.current;
            snapTo(v < -300 ? 1 : v > 300 ? 0 : moved > 0.25 ? 1 : moved < -0.25 ? 0 : (start.current as 0 | 1), -v / (dh || 1));
          }}
          onClick={() => {
            if (dragged.current) return void (dragged.current = false);
            snapTo(chatView ? 0 : 1);
          }}
          className="group -mx-3.5 flex cursor-grab touch-none flex-col items-center gap-2 px-3.5 pt-2 pb-2.5 outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/60 active:cursor-grabbing"
        >
          <span
            aria-hidden="true"
            className="h-1 w-9 rounded-full bg-[#3f3f46] transition-[width,background-color] duration-200 group-hover:w-12 group-hover:bg-[#52525b] group-active:w-12"
          />
          <span className="flex w-full items-center gap-2">
            <span className="text-sm font-semibold">Chat</span>
            <span className="ms-auto flex items-center gap-1.5">
              <AvatarGroup className="[&>[data-slot=avatar]]:ring-surface">
                {members.map((m) => (
                  <Avatar key={m.name} className="size-[22px]">
                    <AvatarFallback className={cn("text-[10px]", m.you && "bg-primary text-primary-foreground")}>{m.initial}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <span className="text-xs text-muted-foreground">{members.length} watching</span>
            </span>
          </span>
        </motion.button>

        <div
          ref={threadRef}
          className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain pt-2 pb-2.5 [mask-image:linear-gradient(to_bottom,transparent,black_20px)]"
        >
          <div aria-hidden="true" className="mt-auto" />
          {chat.messages.map((msg, i) =>
            msg.you ? (
              <p key={i} className="ms-auto max-w-[80%] rounded-[16px_16px_4px_16px] border border-primary-line bg-primary-soft px-3 py-2 text-sm">
                {msg.text}
              </p>
            ) : (
              <div key={i} className="flex items-end gap-2">
                <Avatar className="size-[26px]">
                  <AvatarFallback>{msg.initial}</AvatarFallback>
                </Avatar>
                <p className="max-w-[80%] rounded-[16px_16px_16px_4px] bg-[#27272a] px-3 py-2 text-sm">{msg.text}</p>
              </div>
            ),
          )}
          <div className="flex items-start gap-2">
            <Avatar className="size-[26px]">
              <AvatarFallback className="bg-[#27272a]">{chat.friendQuestion.initial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 items-center gap-2.5 rounded-[16px] border border-line-strong bg-surface-2 py-2.5 ps-3 pe-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground">
                  {chat.friendQuestion.from} asks · closes {chat.friendQuestion.closes}
                </p>
                <p className="mt-0.5 text-sm font-semibold">{chat.friendQuestion.text}</p>
              </div>
              <Button size="sm" className="h-[34px] rounded-sm">
                Yes
              </Button>
              <Button size="sm" variant="secondary" className="h-[34px] rounded-sm border-0">
                No
              </Button>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-1.5 overflow-x-auto pb-2.5">
          {chat.reactions.map((r) => (
            <Button key={r} variant="outline" size="sm" className="h-[30px] shrink-0 text-xs text-[#d4d4d8]">
              {r}
            </Button>
          ))}
        </div>

        <form className="flex shrink-0 gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]" onSubmit={(e) => e.preventDefault()}>
          <Button type="button" variant="soft" size="icon" aria-label="Ask friends a prediction">
            <Plus strokeWidth={2.4} />
          </Button>
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <input
            id="chat-input"
            placeholder="Say something…"
            onFocus={() => snapTo(1)}
            className="h-11 min-w-0 flex-1 rounded-md border border-line-strong bg-surface-2 px-3.5 text-sm outline-none placeholder:text-subtle focus-visible:border-ring"
          />
          <Button type="submit" variant="secondary" size="icon" aria-label="Send message" className="border-0 bg-[#27272a]">
            <ArrowUp />
          </Button>
        </form>
      </section>
    </>
  );
}
