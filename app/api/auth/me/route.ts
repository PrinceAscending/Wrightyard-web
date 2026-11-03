import { NextRequest, NextResponse } from "next/server";
import { avatarUrl, displayName, getSession, isOwner } from "@/lib/auth";
import { rateLimit } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limited = await rateLimit(request, "auth-me", 120, 60);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { user: null },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const response = NextResponse.json({
    user: {
      ...session.user,
      displayName: displayName(session.user),
      avatarUrl: avatarUrl(session.user, 128),
      isOwner: isOwner(session.user.id),
    },
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
