import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await readSessionToken(token) : null;

  if (session) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);

  const response = NextResponse.redirect(login);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
