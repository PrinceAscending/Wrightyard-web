import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { site } from "@/lib/site";
import { NEXT_COOKIE, OAUTH_STATE_COOKIE, nextCookieOptions, stateCookieOptions } from "@/lib/auth";
import { safeNextPath } from "@/lib/redirects";
import { rateLimit } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limited = await rateLimit(request, "auth-login", 20, 900);
  if (!limited.allowed) {
    return new NextResponse("Too many sign-in attempts. Try again in a few minutes.", {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfter), "Cache-Control": "no-store" },
    });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    return new NextResponse("Discord sign-in is not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const state = randomBytes(24).toString("hex");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const authorize = new URL("https://discord.com/oauth2/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", new URL("/api/auth/callback", site.url).toString());
  authorize.searchParams.set("scope", "identify");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize);
  response.cookies.set(OAUTH_STATE_COOKIE, state, stateCookieOptions());
  if (next) {
    response.cookies.set(NEXT_COOKIE, next, nextCookieOptions());
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}
