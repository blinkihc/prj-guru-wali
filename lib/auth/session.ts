// Session management using iron-session
// Last updated: 2025-10-12

import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  email: string;
  fullName: string;
  nipNuptk?: string;
  isLoggedIn: boolean;
}

// Session configuration
const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long_for_security",
  cookieName: "guru_wali_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  },
};

/**
 * Get the current session
 * @returns Session object
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/**
 * Create a new session for a user
 * @param userId - User ID
 * @param email - User email
 * @param fullName - User full name
 */
export async function createSession(
  userId: string,
  email: string,
  fullName: string,
  nipNuptk?: string,
): Promise<void> {
  const session = await getSession();
  session.userId = userId;
  session.email = email;
  session.fullName = fullName;
  session.nipNuptk = nipNuptk;
  session.isLoggedIn = true;
  await session.save();
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

/**
 * Check if user is authenticated
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true;
}

/**
 * Get current user from session
 * @returns User data or null
 */
export async function getCurrentUser(): Promise<Omit<
  SessionData,
  "isLoggedIn"
> | null> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return null;
  }
  return {
    userId: session.userId,
    email: session.email,
    fullName: session.fullName,
    nipNuptk: session.nipNuptk,
  };
}
