import { NextResponse, type NextRequest } from "next/server";

/**
 * First run: send new players to the splash + onboarding.
 * `/welcome` sets `footon_onboarded` when they claim coins or skip.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("footon_onboarded")) {
    return NextResponse.redirect(new URL("/welcome", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
