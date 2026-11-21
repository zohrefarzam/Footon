"use client";

import { useState } from "react";
import { Check, Link2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { shareToTelegram } from "@/lib/gamification/share";
import { track } from "@/lib/track";

/**
 * Invite friends to a challenge you're in: its link (the server's), Copy and a
 * Telegram share. Both buttons are secondary: the page's one lime action is the
 * prediction lock-in.
 */
export function ChallengeInvite({ name, link, code, match }: { name: string; link: string; code: string; match: string }) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  // the server's link when it sent one; otherwise the code alone, which friends can join with
  const url = link ? `https://${link}` : code;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard can be blocked; still show feedback */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const share = async () => {
    const method = await shareToTelegram({ text: `بیا توی چالش «${name}» تا ببینیم کی بهتر پیش‌بینی می‌کنه. ${match}${link ? "" : ` • کد: ${code}`}`, ...(link ? { url } : {}) });
    if (method) {
      setSent(true);
      setTimeout(() => setSent(false), 2400);
      track("card_shared", { surface: "league_invite", method });
    }
  };

  return (
    <Card className="gap-3 p-4">
      <div>
        <h3 className="text-[15px] font-semibold">دوستات را دعوت کن</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">هر کی این لینک را باز کنه می‌تونه به چالش بپیونده.</p>
      </div>
      <p dir="ltr" className="truncate rounded-md border border-line-strong bg-surface-2 px-3 py-2.5 text-start font-mono text-[12px] font-medium text-muted-foreground">
        {link || code}
      </p>
      {link && code && <p className="-mt-1 text-xs text-muted-foreground">کد چالش: <span className="font-mono font-medium text-foreground">{code}</span></p>}
      <div className="flex gap-2">
        <Button variant="secondary" size="lg" className="flex-1" onClick={copy} aria-live="polite">
          {copied ? <Check /> : <Link2 />}
          {copied ? "کپی شد" : link ? "کپی لینک" : "کپی کد"}
        </Button>
        <Button variant="secondary" size="lg" className="flex-1" onClick={share} disabled={!url}>
          {sent ? <Check /> : <Send className="rtl:-scale-x-100" />}
          {sent ? "رفت" : "تلگرام"}
        </Button>
      </div>
    </Card>
  );
}
