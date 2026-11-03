import { jwtVerify } from "jose";
import { z } from "zod";

export const SESSION_COOKIE = "wy_session";
export const OAUTH_STATE_COOKIE = "wy_oauth_state";
export const NEXT_COOKIE = "wy_next";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const sessionUserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  globalName: z.string().nullable(),
  avatar: z.string().nullable(),
  discriminator: z.string().nullable(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

export type Session = {
  user: SessionUser;
  iat: number;
  exp: number;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET is missing or too short (minimum 32 characters).");
  }
  return new TextEncoder().encode(value);
}

export async function readSessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    const user = sessionUserSchema.safeParse(payload.user);
    if (!user.success) return null;
    return {
      user: user.data,
      iat: Number(payload.iat ?? 0),
      exp: Number(payload.exp ?? 0),
    };
  } catch {
    return null;
  }
}
