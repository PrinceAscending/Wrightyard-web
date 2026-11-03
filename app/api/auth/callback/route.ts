import { NextRequest, NextResponse } from "next/server";
import {
  NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  createSession,
  nextCookieOptions,
  sessionCookieOptions,
  stateCookieOptions,
} from "@/lib/auth";
import { safeNextPath } from "@/lib/redirects";
import { rateLimit } from "@/lib/security";
import { discordUserSchema } from "@/lib/validation";
import { site } from "@/lib/site";

export const runtime = "nodejs";

function fail(reason: string) {
  const response = NextResponse.redirect(new URL(`/login?error=${reason}`, site.url));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const limited = await rateLimit(request, "auth-callback", 20, 900);
  if (!limited.allowed) return fail("rate");

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return fail("denied");

  const code = params.get("code");
  const state = params.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail("state");
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("config");

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: new URL("/api/auth/callback", site.url).toString(),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (!tokenResponse.ok) {
      console.error("[auth] token exchange failed", tokenResponse.status);
      return fail("exchange");
    }

    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) return fail("exchange");

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (!userResponse.ok) {
      console.error("[auth] user fetch failed", userResponse.status);
      return fail("profile");
    }

    const parsed = discordUserSchema.safeParse(await userResponse.json());
    if (!parsed.success) return fail("profile");

    const session = await createSession({
      id: parsed.data.id,
      username: parsed.data.username,
      globalName: parsed.data.global_name ?? null,
      avatar: parsed.data.avatar ?? null,
      discriminator: parsed.data.discriminator ?? null,
    });

    const destination = safeNextPath(request.cookies.get(NEXT_COOKIE)?.value) ?? "/dashboard";
    const response = NextResponse.redirect(new URL(destination, site.url));
    response.cookies.set(SESSION_COOKIE, session, sessionCookieOptions());
    response.cookies.set(OAUTH_STATE_COOKIE, "", { ...stateCookieOptions(), maxAge: 0 });
    response.cookies.set(NEXT_COOKIE, "", { ...nextCookieOptions(), maxAge: 0 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("[auth] callback failed", error);
    return fail("exchange");
  }
}
