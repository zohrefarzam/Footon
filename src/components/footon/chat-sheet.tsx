"use client";

import { useState } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { ArrowUp, ChevronUp, Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Member = { name: string; initial: string; you?: boolean };
type Chat = {
  messages: { from: string; initial: string; text: string }[];
  friendQuestion: { from: string; initial: string; text: string; closes: string };
  reactions: string[];
};

/**
 * Glass chat sheet pinned to the bottom of the live screen. Collapsed it is a
 * peek (latest activity + reactions + input) so the question stays the focus;
 * drag the handle up or tap the header to open the full thread.
 */
export function ChatSheet({ chat, members }: { chat: Chat; members: Member[] }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const drag = useDragControls();
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 34 };
  const unread = chat.messages.length + 1;

  return (
    <motion.section
      aria-label="League chat"
      drag={reduce ? false : "y"}
      dragControls={drag}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.15}
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (info.offset.y < -40) setOpen(true);
        if (info.offset.y > 40) setOpen(false);
      }}
      className="glass sticky bottom-2 mx-2 flex flex-col gap-2.5 rounded-3xl border border-line-strong px-3.5 pt-2 pb-3.5"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onPointerDown={(e) => drag.start(e)}
        aria-expanded={open}
        aria-controls="chat-thread"
        className="-mx-1 flex touch-none flex-col gap-2 rounded-xl px-1 pb-0.5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
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
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring} className="text-muted-foreground">
              <ChevronUp className="size-4" aria-hidden="true" />
            </motion.span>
          </span>
        </span>
        {!open && (
          <span className="truncate text-start text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">{chat.friendQuestion.from}</span> asks: {chat.friendQuestion.text}
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="chat-thread"
            key="thread"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: spring, opacity: { duration: reduce ? 0 : 0.2 } }}
            className="overflow-hidden"
          >
            <div className="flex max-h-[45dvh] flex-col gap-2.5 overflow-y-auto overscroll-contain">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          onFocus={() => setOpen(true)}
          className="h-11 min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-3.5 text-sm outline-none placeholder:text-subtle focus-visible:border-ring"
        />
        <Button type="submit" variant="secondary" size="icon" aria-label="Send message" className="border-0 bg-[#27272a]">
          <ArrowUp />
        </Button>
      </form>
    </motion.section>
  );
}
