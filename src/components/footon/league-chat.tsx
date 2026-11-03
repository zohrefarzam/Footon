"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Member = { name: string; initial: string; you?: boolean };
export type ChatData = {
  messages: { from: string; initial: string; text: string; you?: boolean }[];
  friendQuestion: { from: string; initial: string; text: string; closes: string };
  reactions: string[];
};

/**
 * The league's chat as a match-page section: who's watching, the thread (yours
 * right in soft-lime), a friend's question as an inline Yes/No card, quick
 * reactions, and a composer pinned to the bottom of the screen.
 */
export function LeagueChat({ chat, members }: { chat: ChatData; members: Member[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, []);

  return (
    <section aria-label="League chat" className="flex min-h-[calc(100dvh-180px)] flex-col">
      <div className="flex items-center gap-2 pb-3">
        <AvatarGroup className="[&>[data-slot=avatar]]:ring-background">
          {members.map((m) => (
            <Avatar key={m.name} className="size-[22px]">
              <AvatarFallback className={cn("text-[10px]", m.you && "bg-primary text-primary-foreground")}>{m.initial}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
        <span className="text-xs text-muted-foreground">{members.length} watching</span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 pb-3" aria-live="polite">
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
              <p className="max-w-[80%] rounded-[16px_16px_16px_4px] bg-surface-3 px-3 py-2 text-sm">
                <span className="sr-only">{msg.from}: </span>
                {msg.text}
              </p>
            </div>
          ),
        )}
        <div className="flex items-start gap-2">
          <Avatar className="size-[26px]">
            <AvatarFallback className="bg-surface-3">{chat.friendQuestion.initial}</AvatarFallback>
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
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 -mx-5 flex flex-col gap-2.5 border-t border-line bg-background px-5 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
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
            className="h-11 min-w-0 flex-1 rounded-md border border-line-strong bg-surface-2 px-3.5 text-sm outline-none placeholder:text-subtle focus-visible:border-ring"
          />
          <Button type="submit" variant="secondary" size="icon" aria-label="Send message">
            <ArrowUp />
          </Button>
        </form>
      </div>
    </section>
  );
}
