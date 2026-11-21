import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL ?? "https://api.rayenx.ir";

export const ACCESS = "lf_access";
export const REFRESH = "lf_refresh";

type Tokens = {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
};

/** A call to one backend service, e.g. `backend("identity/auth/refresh")`. */
export function backend(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("accept-language", "fa-IR"); // the app is Persian only, so the backend's messages come back in Persian
  return fetch(`${BACKEND}/api/${path}`, { ...init, headers, cache: "no-store" });
}

/** Tokens live in httpOnly cookies: the browser never reads them. */
export async function setSession(t: Tokens) {
  const jar = await cookies();
  const base = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" } as const;
  jar.set(ACCESS, t.accessToken, { ...base, expires: new Date(t.accessTokenExpiresAtUtc) });
  jar.set(REFRESH, t.refreshToken, { ...base, expires: new Date(t.refreshTokenExpiresAtUtc) });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(ACCESS);
  jar.delete(REFRESH);
}

/** Swaps the refresh cookie for new tokens. Returns the new access token, or null (and signs out) when it fails. */
export async function refreshSession(): Promise<string | null> {
  const refreshToken = (await cookies()).get(REFRESH)?.value;
  if (refreshToken) {
    const res = await backend("identity/auth/refresh", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => null);
    if (res?.ok) {
      const tokens = (await res.json()) as Tokens;
      await setSession(tokens);
      return tokens.accessToken;
    }
  }
  await clearSession();
  return null;
}
