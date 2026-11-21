import { cookies } from "next/headers";

import { REFRESH, backend, clearSession, setSession } from "@/lib/server/session";

const UPSTREAM: Record<string, string> = {
  otp: "identity/auth/otp/request",
  verify: "identity/auth/otp/verify",
};

/** Login door: `otp` sends the code, `verify` trades it for cookies, `logout` ends the session. Tokens never reach the browser. */
export async function POST(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;

  if (action === "logout") {
    const refreshToken = (await cookies()).get(REFRESH)?.value;
    if (refreshToken) {
      await backend("identity/auth/logout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => null);
    }
    await clearSession();
    return new Response(null, { status: 204 });
  }

  const upstream = UPSTREAM[action];
  if (!upstream) return new Response(null, { status: 404 });

  const res = await backend(upstream, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: await req.text(),
  }).catch(() => null);
  if (!res) return new Response(null, { status: 502 });

  if (action === "verify" && res.ok) {
    await setSession(await res.json());
    return new Response(null, { status: 204 });
  }
  return new Response(res.body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}
