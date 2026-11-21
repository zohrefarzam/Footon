"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toLatinDigits } from "@/lib/format";

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
    <form onSubmit={submit} className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center gap-5 px-5">
      <h1 className="font-display text-[22px] font-bold">ورود به لاکی فن</h1>

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
          required
        />
      </div>

      {sent && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="code">کدی که برات فرستادیم</Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            dir="ltr"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={busy}
            required
            autoFocus
          />
        </div>
      )}

      <p role="alert" className="min-h-5 text-[13px] text-muted-foreground">
        {error}
      </p>

      <Button type="submit" size="lg" disabled={busy}>
        {sent ? "ورود" : "ارسال کد"}
      </Button>
    </form>
  );
}
