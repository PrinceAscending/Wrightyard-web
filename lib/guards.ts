import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { notFound, redirect } from "next/navigation";
import { getSession, isOwner, type Session } from "@/lib/auth";
import { isSameOrigin, rateLimit } from "@/lib/security";

type ApiGuard =
  | { ok: true; session: Session }
  | { ok: false; response: NextResponse };

export async function requireSessionApi(request: NextRequest): Promise<ApiGuard> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sign in required." }, { status: 401 }),
    };
  }
  return { ok: true, session };
}

export async function requireOwnerApi(
  request: NextRequest,
  bucket = "admin",
  options: { requireOrigin?: boolean } = {},
): Promise<ApiGuard> {
  if ((options.requireOrigin ?? true) && !isSameOrigin(request)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid request origin." }, { status: 403 }),
    };
  }

  const limited = await rateLimit(request, bucket, 30, 60);
  if (!limited.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many admin actions. Wait a minute." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      ),
    };
  }

  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Sign in required." }, { status: 401 }),
    };
  }

  if (!isOwner(session.user.id)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Owner access only." }, { status: 403 }),
    };
  }

  return { ok: true, session };
}

export async function requireDashboardSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireOwnerPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isOwner(session.user.id)) notFound();
  return session;
}
