"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Plus, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { COSTS, formatCoins } from "@/lib/economy";
import { cn } from "@/lib/utils";
import { Coin } from "./coin";

type Member = { name: string; initial: string; you?: boolean };
type Answer = "yes" | "no";
export type FriendQuestion = { id: string; from: string; initial: string; text: string; closes: string; you?: boolean; yourCall?: Answer };
export type ChatData = {
  messages: { from: string; initial: string; text: string; you?: boolean }[];
  questions: FriendQuestion[];
  reactions: string[];
};

type Item = { kind: "msg"; from: string; initial: string; text: string; you?: boolean } | ({ kind: "q" } & FriendQuestion);

const MAX_Q = 60;

/** A friend's (or your) Yes/No question inline in the thread. Answering records your pick. */
function QuestionItem({ q }: { q: FriendQuestion }) {
  const [pick, setPick] = useState<Answer | undefined>(q.yourCall);
  const answered = q.you || pick;
  return (
    <div className={cn("flex items-start gap-2", q.you && "flex-row-reverse")}>
      {!q.you && (
        <Avatar className="size-[26px]">
          <AvatarFallback className="bg-surface-3">{q.initial}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-1 items-center gap-2.5 rounded-[16px] border py-2.5 ps-3 pe-2.5",
          q.you ? "max-w-[88%] border-primary-line bg-primary-soft" : "border-line-strong bg-surface-2",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">
            {q.you ? "You asked" : `${q.from} asks`} · closes {q.closes}
          </p>
          <p className="mt-0.5 text-sm font-semibold">{q.text}</p>
        </div>
        {answered ? (
          <span className="shrink-0 rounded-full border border-primary-line bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
            {q.you ? "Your call" : "You"}: {(q.you ? q.yourCall : pick) === "yes" ? "Yes" : "No"}
          </span>
        ) : (
          <>
            <Button size="sm" className="h-[34px] rounded-sm" onClick={() => setPick("yes")} aria-label={`Yes to ${q.text}`}>
              Yes
            </Button>
            <Button size="sm" variant="secondary" className="h-[34px] rounded-sm border-0" onClick={() => setPick("no")} aria-label={`No to ${q.text}`}>
              No
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The league's chat as a match-page section: who's watching, the thread (yours
 * right in soft-lime), friends' questions as inline Yes/No cards, quick
 * reactions, and a composer pinned to the bottom of the screen. The + turns the
 * composer into "ask a prediction": a short question and your own Yes / No.
 */
export function LeagueChat({ chat, members, closes = "90'" }: { chat: ChatData; members: Member[]; closes?: string }) {
  const endRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>(() => [
    ...chat.messages.map((m) => ({ kind: "msg" as const, ...m })),
    ...chat.questions.map((q) => ({ kind: "q" as const, ...q })),
  ]);
  const [text, setText] = useState("");
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [call, setCall] = useState<Answer | undefined>();
  const [seq, setSeq] = useState(0);
  const askRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [items.length]);
  useEffect(() => {
    if (asking) askRef.current?.focus();
  }, [asking]);

  const send = (t: string) => {
    const v = t.trim();
    if (!v) return;
    setItems((xs) => [...xs, { kind: "msg", from: "You", initial: "Y", text: v, you: true }]);
    setText("");
  };
  const post = () => {
    const v = question.trim();
    if (!v || !call) return;
    setItems((xs) => [...xs, { kind: "q", id: `mine-${seq}`, from: "You", initial: "Y", text: v.endsWith("?") ? v : `${v}?`, closes, you: true, yourCall: call }]);
    setSeq((n) => n + 1);
    setQuestion("");
    setCall(undefined);
    setAsking(false);
  };

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
        <span className="text-xs text-muted-foreground">{members.length} in the league</span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 pb-3" aria-live="polite">
        <div aria-hidden="true" className="mt-auto" />
        {items.map((it, i) =>
          it.kind === "q" ? (
            <QuestionItem key={it.id} q={it} />
          ) : it.you ? (
            <p key={i} className="ms-auto max-w-[80%] rounded-[16px_16px_4px_16px] border border-primary-line bg-primary-soft px-3 py-2 text-sm">
              {it.text}
            </p>
          ) : (
            <div key={i} className="flex items-end gap-2">
              <Avatar className="size-[26px]">
                <AvatarFallback>{it.initial}</AvatarFallback>
              </Avatar>
              <p className="max-w-[80%] rounded-[16px_16px_16px_4px] bg-surface-3 px-3 py-2 text-sm">
                <span className="sr-only">{it.from}: </span>
                {it.text}
              </p>
            </div>
          ),
        )}
        <div ref={endRef} className="scroll-mb-40" />
      </div>

      <div className="sticky bottom-0 -mx-5 flex flex-col gap-2.5 border-t border-line bg-background px-5 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {asking ? (
          <form
            className="animate-in-up flex flex-col gap-2.5"
            aria-label="Ask a prediction"
            onSubmit={(e) => {
              e.preventDefault();
              post();
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-muted-foreground">Ask the league · closes {closes}</span>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Close question" onClick={() => setAsking(false)}>
                <X />
              </Button>
            </div>
            <div className="relative">
              <label htmlFor="ask-input" className="sr-only">
                Your question
              </label>
              <input
                ref={askRef}
                id="ask-input"
                value={question}
                maxLength={MAX_Q}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Pen before 60'?"
                className="h-11 w-full rounded-md border border-line-strong bg-surface-2 ps-3.5 pe-14 text-sm outline-none placeholder:text-subtle focus-visible:border-ring"
              />
              <span className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 font-mono text-[11px] text-muted-foreground">
                {question.length}/{MAX_Q}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span id="your-call" className="text-xs text-muted-foreground">
                Your call
              </span>
              <div role="radiogroup" aria-labelledby="your-call" className="flex gap-1.5">
                {(["yes", "no"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    role="radio"
                    aria-checked={call === a}
                    onClick={() => setCall(a)}
                    className={cn(
                      "h-9 w-14 rounded-sm border text-sm font-semibold outline-none transition-[transform,background-color,border-color,color] duration-150 ease-spring active:scale-95 focus-visible:ring-[3px] focus-visible:ring-ring/60",
                      call === a ? "border-primary-line bg-primary-soft text-primary" : "border-line-strong bg-surface-2 text-muted-foreground",
                    )}
                  >
                    {a === "yes" ? "Yes" : "No"}
                  </button>
                ))}
              </div>
              <Button type="submit" variant="soft" className="ms-auto h-9 rounded-sm px-3.5" disabled={!question.trim() || !call}>
                Post
                <span className="flex items-center gap-1 font-display text-[15px] font-bold">
                  {formatCoins(COSTS.chatQuestion)}
                  <Coin className="size-4 text-[8px]" />
                  <span className="sr-only">coins</span>
                </span>
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
              {chat.reactions.map((r) => (
                <Button key={r} variant="outline" size="sm" className="h-[30px] shrink-0 text-xs text-silver" onClick={() => send(r)}>
                  {r}
                </Button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(text);
              }}
            >
              <Button type="button" variant="soft" size="icon" aria-label="Ask friends a prediction" onClick={() => setAsking(true)}>
                <Plus strokeWidth={2.4} />
              </Button>
              <label htmlFor="chat-input" className="sr-only">
                Message
              </label>
              <input
                id="chat-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Say something…"
                className="h-11 min-w-0 flex-1 rounded-md border border-line-strong bg-surface-2 px-3.5 text-sm outline-none placeholder:text-subtle focus-visible:border-ring"
              />
              <Button type="submit" variant="secondary" size="icon" aria-label="Send message">
                <ArrowUp />
              </Button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
