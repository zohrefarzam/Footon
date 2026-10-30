"use client";

import { useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ArrowUp, Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Member = { name: string; initial: string; you?: boolean };
type Chat = {
  messages: { from: string; initial: string; text: string }[];
  friendQuestion: { from: string; initial: string; text: string; closes: string };
  reactions: string[];
};

const PREVIEW = 20; // height of the one-line peek shown when closed
// Snap heights for the thread, as a share of the viewport: peek, half, tall.
const snaps = () => [0, 0.3, 0.6].map((f) => Math.round(window.innerHeight * f));

/**
 * Resizable glass chat panel fixed to the bottom of the live screen. Drag the
 * handle to any height; on release it springs to the nearest snap (flick
 * velocity included). Tap the header to toggle peek / half.
 * Render <ChatSheetSpacer /> at the end of the page so content clears the peek.
 */
export function ChatSheet({ chat, members }: { chat: Chat; members: Member[] }) {
  const reduce = useReducedMotion();
  const h = useMotionValue(0);
  const region = useTransform(h, (v) => v + PREVIEW);
  const previewOpacity = useTransform(h, [0, 40], [1, 0]);
  const threadOpacity = useTransform(h, [10, 80], [0, 1]);
  const scrim = useTransform(h, [0, 300], [0, 0.6]);
  const [open, setOpen] = useState(false);
  const start = useRef(0);
  const dragged = useRef(false);
  const unread = chat.messages.length + 1;

  const snapTo = (v: number) => {
    setOpen(v > 0);
    animate(h, v, reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 36, velocity: 0 });
  };

  return (
    <>
      {/* Dims the match behind as the panel rises; tap it to close. */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: scrim }}
        onClick={() => snapTo(0)}
        className={cn("fixed inset-0 z-10 bg-black", !open && "pointer-events-none")}
      />
      <section
        aria-label="League chat"
        className="glass fixed inset-x-2 bottom-2 z-20 mx-auto flex max-w-[414px] flex-col gap-2.5 rounded-3xl border border-line-strong px-3.5 pt-2 pb-3.5"
      >
        <motion.button
          type="button"
          aria-expanded={open}
          aria-controls="chat-thread"
          onPanStart={() => {
            start.current = h.get();
            dragged.current = true;
          }}
          onPan={(_, i) => {
            const [, , max] = snaps();
            const v = start.current - i.offset.y;
            // Rubber-band past the ends instead of a hard stop.
            h.set(v < 0 ? v * 0.2 : v > max ? max + (v - max) * 0.2 : v);
          }}
          onPanEnd={(_, i) => {
            const target = h.get() - i.velocity.y * 0.15;
            snapTo(snaps().reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a)));
          }}
          onClick={() => {
            if (dragged.current) return void (dragged.current = false);
            snapTo(open ? 0 : snaps()[1]);
          }}
          className="-mx-1 flex cursor-grab touch-none flex-col gap-2 rounded-xl px-1 pb-0.5 outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/60 active:cursor-grabbing"
        >
          <span aria-hidden="true" className="h-1 w-9 self-center rounded-full bg-[#3f3f46]" />
          <span className="flex w-full items-center gap-2">
            <span className="text-sm font-semibold">Chat</span>
            {!open && (
              <span className="rounded-full bg-surface-3 px-1.5 font-display text-xs font-bold" aria-label={`${unread} new`}>
                {unread}
              </span>
            )}
            <span className="ms-auto flex items-center gap-1.5">
              <AvatarGroup className="[&>[data-slot=avatar]]:ring-surface-2">
                {members.map((p) => (
                  <Avatar key={p.name} className="size-[22px]">
                    <AvatarFallback className={cn("text-[10px]", p.you && "bg-primary text-primary-foreground")}>{p.initial}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <span className="text-xs text-muted-foreground">{members.length} watching</span>
            </span>
          </span>
        </motion.button>

        {/* ponytail: animates height (one fixed element, no page reflow); move to a translateY sheet if it ever janks. */}
        <motion.div style={{ height: region }} className="relative overflow-hidden">
          <motion.p
            style={{ opacity: previewOpacity }}
            aria-hidden={open}
            className="pointer-events-none absolute inset-x-0 top-0 truncate text-[13px] text-muted-foreground"
          >
            <span className="font-semibold text-foreground">{chat.friendQuestion.from}</span> asks: {chat.friendQuestion.text}
          </motion.p>

          <motion.div
            id="chat-thread"
            inert={!open}
            style={{ opacity: threadOpacity }}
            className="flex h-full flex-col justify-end gap-2.5 overflow-y-auto overscroll-contain"
          >
            {chat.messages.map((msg, i) => (
              <div key={i} className="flex items-end gap-2">
                <Avatar className="size-[26px]">
                  <AvatarFallback>{msg.initial}</AvatarFallback>
                </Avatar>
                <p className="rounded-[16px_16px_16px_4px] bg-[#27272a] px-3 py-2 text-sm">{msg.text}</p>
              </div>
            ))}

            <div className="flex items-start gap-2">
              <Avatar className="size-[26px]">
                <AvatarFallback className="bg-[#27272a]">{chat.friendQuestion.initial}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 items-center gap-2.5 rounded-[16px] border border-line-strong bg-surface py-2.5 ps-3 pe-2.5">
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
          </motion.div>
        </motion.div>

        <div className="flex gap-1.5 overflow-x-auto">
          {chat.reactions.map((r) => (
            <Button key={r} variant="outline" size="sm" className="h-[30px] shrink-0 text-xs text-[#d4d4d8]">
              {r}
            </Button>
          ))}
        </div>

        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
          <Button type="button" variant="soft" size="icon" aria-label="Ask friends a prediction">
            <Plus strokeWidth={2.4} />
          </Button>
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <input
            id="chat-input"
            placeholder="Say something…"
            onFocus={() => !open && snapTo(snaps()[1])}
            className="h-11 min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-3.5 text-sm outline-none placeholder:text-subtle focus-visible:border-ring"
          />
          <Button type="submit" variant="secondary" size="icon" aria-label="Send message" className="border-0 bg-[#27272a]">
            <ArrowUp />
          </Button>
        </form>
      </section>
    </>
  );
}

/** Reserves the closed panel's height at the end of the page. */
export function ChatSheetSpacer() {
  return <div aria-hidden="true" className="h-[190px] shrink-0" />;
}
