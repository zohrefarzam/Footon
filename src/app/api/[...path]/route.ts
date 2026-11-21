import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { ACCESS, backend, refreshSession } from "@/lib/server/session";

/**
 * Same-origin door to the backend (`/api/gamification/me/progress` →
 * `api.rayenx.ir/api/gamification/me/progress`): adds the Bearer token from
 * the cookie, and refreshes it once on a 401.
 */
async function handle(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = `${path.join("/")}${req.nextUrl.search}`;
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();

  const send = (token: string) => {
    const headers: Record<string, string> = { authorization: `Bearer ${token}` };
    for (const h of ["content-type", "idempotency-key"]) {
      const v = req.headers.get(h);
      if (v) headers[h] = v;
    }
    return backend(target, { method: req.method, headers, body });
  };

  // the access cookie expires with the token, so a missing one means "refresh first"
  const token = (await cookies()).get(ACCESS)?.value ?? (await refreshSession());
  if (!token) return new Response(null, { status: 401 });

  let res = await send(token).catch(() => null);
  if (res?.status === 401) {
    const fresh = await refreshSession();
    if (!fresh) return new Response(null, { status: 401 });
    res = await send(fresh).catch(() => null);
  }
  if (!res) return new Response(null, { status: 502 });

  return new Response(res.body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
