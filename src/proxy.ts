import { NextResponse, type NextRequest } from "next/server";

/**
 * First run: send new players to the splash + onboarding.
 * `/welcome` sets `luckyfan_onboarded` when they claim coins or skip.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("luckyfan_onboarded")) {
    return NextResponse.redirect(new URL("/welcome", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
