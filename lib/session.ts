"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { encrypt, decrypt } from "./jwt";
import { type JWTPayload } from "jose";

export interface SessionPayload extends JWTPayload {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: "user" | "admin";
}

// Constants
const SESSION_COOKIE_NAME = "ironclad-app-session";
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;
const THIRTY_DAYS_FROM_NOW = new Date(Date.now() + THIRTY_DAYS_IN_SECONDS * 1000);

/**
 * Creates a session cookie with user data.
 * This function should be called after successful user authentication (login).
 *
 * @param userData The user data to be stored in the session. Must conform to SessionPayload.
 */
export async function createSession(userData: SessionPayload): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = await encrypt(userData);

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: THIRTY_DAYS_FROM_NOW,
    maxAge: THIRTY_DAYS_IN_SECONDS,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Deletes the session cookie, effectively logging out the user.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  // Optionally, redirect after deleting the session
  redirect("/login");
}
export async function deleteSessionNoRedirect(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Retrieves and decrypts the session data from the cookie.
 *
 * @returns A Promise that resolves to the decrypted SessionPayload or null if no valid session exists.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  // Attempt to decrypt the session. Returns null on failure.
  const session = await decrypt(sessionCookie);

  if (!session) {
    // If decryption fails (e.g., token tampered, expired), delete the invalid cookie.
    console.warn("Invalid or expired session token detected. Deleting cookie.");
    await deleteSession();
    return null;
  }

  return session;
}

// Session Verification Functions

/**
 * Verifies if a user session exists. If not, redirects to the login page.
 *
 * @returns A Promise that resolves to the SessionPayload if a valid session exists.
 */
export async function verifyUserSession(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session || session.isActive === false) {
    redirect("/login");
  }

  return session;
}

/**
 * Verifies if the active session belongs to an admin user.
 * If not, redirects to the home page or login page.
 *
 * @returns A Promise that resolves to the SessionPayload if a valid admin session exists.
 */
export async function verifyAdminSession(): Promise<SessionPayload> {
  const session = await getSession();

  if (!session || session.isActive === false) {
    redirect("/login");
  }

  // If session exists but role is not 'admin', redirect to home.
  if (session.role !== "admin") {
    redirect("/");
  }

  return session;
}

/**
 * Refreshes the session cookie's expiration.
 * Call this periodically to keep a user logged in if they are active.
 *
 * @param currentSession The current decrypted session payload.
 */
export async function refreshSessionExpiration(
  currentSession: SessionPayload
): Promise<void> {
  await createSession(currentSession);
}
