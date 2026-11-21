import type { ZodType } from "zod";

import { ApiError } from "@/lib/gamification/api/client";

/** GET through this app's proxy (`/api/<service>/...`), parsed before the UI sees it. Browser only. */
export async function getJson<T>(path: string, schema: ZodType<T>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/${path}`);
  } catch {
    throw new ApiError("offline");
  }
  if (!res.ok) throw new ApiError(res.status === 401 ? "unauthorized" : "server", `HTTP ${res.status}`);
  const parsed = schema.safeParse(await res.json());
  if (!parsed.success) throw new ApiError("invalid_response", parsed.error.message);
  return parsed.data;
}
