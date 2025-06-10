import { NextResponse } from "next/server";

import { getSession, refreshSessionExpiration, deleteSession } from "@/lib/session";

import type { NextRequest } from "next/server";
import { SessionPayload } from "@/lib/jwt";

const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

// If the session has less than this many days remaining, we'll refresh it.
const SESSION_REFRESH_THRESHOLD_DAYS = 7;

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // Get the current session
  const session = await getSession();

  // Session Management Logic
  if (!session) {
    // No valid session
    if (!isPublicRoute) {
      // If no session and route is private, redirect to login.
      console.log(`Middleware: No session, redirecting to /login from ${path}`);
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    } else {
      // If no session and route is public, allow access.
      console.log(`Middleware: No session, allowing access to public route ${path}`);
      return NextResponse.next();
    }
  }

  // Check if the session needs to be refreshed.
  if (session.exp && session.iat) {
    const issuedAtMs = session.iat * 1000;
    const expirationMs = session.exp * 1000;
    const nowMs = Date.now();

    const totalSessionDurationMs = expirationMs - issuedAtMs;
    const timeRemainingMs = expirationMs - nowMs;

    // Calculate the threshold in milliseconds.
    const refreshThresholdMs = SESSION_REFRESH_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

    // Log for debugging
    // console.log(`Middleware: Session remaining: ${timeRemainingMs / (1000 * 60 * 60 * 24)} days`);
    // console.log(`Middleware: Refresh threshold: ${refreshThresholdMs / (1000 * 60 * 60 * 24)} days`);

    if (timeRemainingMs < refreshThresholdMs) {
      // If time remaining is less than our threshold, refresh the session.
      console.log(
        `Middleware: Session approaching expiration (${
          timeRemainingMs / (1000 * 60 * 60 * 24)
        } days left), refreshing.`
      );
      // IMPORTANT: refreshSessionExpiration needs the *current* session payload
      await refreshSessionExpiration(session);
    }
  }

  // If a valid session exists and it's not a public route allow the request to proceed.
  console.log(
    `Middleware: Valid session for user ${session.id}, allowing access to ${path}`
  );
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - /api (API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - Any files with extensions (e.g., .png, .jpg, .css, .js, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|map|json|xml|txt)$).*)",
  ],
};
