import { NextResponse, type NextRequest } from "next/server";

/** With a backend configured, every app screen needs a session (the refresh cookie set by `/api/auth/verify`). */
const BACKEND_ON = !!process.env.NEXT_PUBLIC_GAMIFICATION_API;

/**
 * First run: send new players to the splash + onboarding.
 * `/welcome` sets `luckyfan_onboarded` when they claim coins or skip.
 * With a backend configured, signed-out players go to `/login` first, then on to onboarding.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // login comes first: claiming the starter coins and saving clubs need an account
  if (BACKEND_ON && !request.cookies.has("lf_refresh")) {
    const login = new URL("/login", request.url);
    // an invite link (or any deep link) comes back after login
    if (pathname !== "/") login.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }
  if (pathname === "/" && !request.cookies.has("luckyfan_onboarded")) {
    return NextResponse.redirect(new URL("/welcome", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // everything except the login/styleguide screens, the API door, Next internals and files (icons, fonts)
  matcher: "/((?!api|_next|login|styleguide|.*\\..*).*)",
};
