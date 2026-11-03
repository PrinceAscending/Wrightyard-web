import "server-only";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import {
  NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  readSessionToken,
  type Session,
  type SessionUser,
} from "@/lib/session-token";

export { NEXT_COOKIE, OAUTH_STATE_COOKIE, SESSION_COOKIE, SESSION_MAX_AGE };
export type { Session, SessionUser };

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET is missing or too short (minimum 32 characters).");
  }
  return new TextEncoder().encode(value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function stateCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10,
  };
}

export function nextCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10,
  };
}

export async function createSession(user: SessionUser) {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export function isOwner(userId: string) {
  const owner = process.env.OWNER_ID;
  return Boolean(owner) && userId === owner;
}

export function displayName(user: SessionUser) {
  return user.globalName?.trim() || user.username;
}

export function avatarUrl(user: SessionUser, size = 128) {
  if (!user.avatar) {
    const fallback = Number(user.id) % 5;
    return `https://cdn.discordapp.com/embed/avatars/${fallback}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size}`;
}
