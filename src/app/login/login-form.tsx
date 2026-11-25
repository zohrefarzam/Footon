"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { LoginHero } from "@/components/footon/login-hero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toLatinDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

async function post(action: "otp" | "verify", body: object) {
  try {
    const res = await fetch(`/api/auth/${action}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Phone → code. The server keeps the tokens in cookies; this only learns "it worked". */
export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  // only a path on this app, never another site
  const after = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const phoneNumber = toLatinDigits(phone).trim();
    if (!sent) {
      if (await post("otp", { phoneNumber })) setSent(true);
      else setError("کد ارسال نشد. شماره را چک کن و دوباره امتحان کن.");
    } else if (await post("verify", { phoneNumber, code: toLatinDigits(code).trim() })) {
      router.replace(after);
      router.refresh();
      return;
    } else {
      setError("کد درست نیست. دوباره امتحان کن.");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-6 px-5 py-5">
      <LoginHero sent={sent} />

      <ol className="flex gap-2" aria-label="مرحله‌ها">
        {["نیمهٔ اول: شماره", "نیمهٔ دوم: کد"].map((label, i) => (
          <li
            key={label}
            aria-current={(i === 1) === sent ? "step" : undefined}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold",
              (i === 1) === sent ? "border-primary-line bg-primary-soft text-primary" : "border-line bg-surface text-muted-foreground",
            )}
          >
            {label}
          </li>
        ))}
      </ol>

      <div key={String(sent)} className="animate-in-up flex flex-col gap-1.5">
        <h1 className="font-display text-[28px] font-bold leading-tight">{sent ? "پاس گل رسید!" : "سوت شروع را بزن!"}</h1>
        <p className="text-[15px] text-muted-foreground">
          {sent ? "کدی که فرستادیم را اینجا بزن." : "شماره‌ات را بده تا برات کد بفرستیم."}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">شماره موبایل</Label>
        <Input
          id="phone"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          placeholder="09123456789"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={sent || busy}
          className="h-14 rounded-lg text-lg"
          required
        />
      </div>

      {sent && (
        <div className="animate-in-up flex flex-col gap-2">
          <Label htmlFor="code">کد تأیید</Label>
          <Input
            id="code"
            lang="en"
            inputMode="numeric"
            autoComplete="one-time-code"
            dir="ltr"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={busy}
            className="h-16 rounded-lg text-center font-mono text-2xl tracking-[0.4em]"
            required
            autoFocus
          />
          <Button type="button" variant="ghost" size="sm" className="self-start" disabled={busy} onClick={() => { setSent(false); setCode(""); setError(null); }}>
            شماره را عوض کن
          </Button>
        </div>
      )}

      <p role="alert" className="min-h-5 text-[13px] text-loss">
        {error}
      </p>

      <Button type="submit" size="lg" className="mt-auto" disabled={busy}>
        {busy ? "صبر کن…" : sent ? "ورود به زمین" : "ارسال کد"}
      </Button>
    </form>
  );
}
