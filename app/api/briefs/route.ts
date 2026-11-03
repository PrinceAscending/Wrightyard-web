import { NextRequest, NextResponse } from "next/server";
import { createBrief } from "@/lib/briefs";
import { getSession } from "@/lib/auth";
import { isSameOrigin, rateLimit } from "@/lib/security";
import { briefInput } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const limited = await rateLimit(request, "brief-submit", 5, 600);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "The job book is full for a moment. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = briefInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Add a name, what you need, and a sentence or two about the work.",
      },
      { status: 422 },
    );
  }

  // Honeypot: a filled field means an automated submission. Return a receipt
  // shape so the bot does not learn that it was discarded.
  if (parsed.data.trap) {
    return NextResponse.json({ ok: true, reference: "WY-FILED" });
  }

  const session = await getSession().catch(() => null);

  try {
    const brief = await createBrief({
      name: parsed.data.name,
      contact: parsed.data.contact,
      service: parsed.data.service,
      timeline: parsed.data.timeline,
      notes: parsed.data.notes,
      userId: session?.user.id ?? null,
      username: session
        ? session.user.globalName?.trim() || session.user.username
        : null,
    });

    return NextResponse.json(
      {
        ok: true,
        id: brief.id,
        reference: brief.reference,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("[briefs] submission failed", error);
    return NextResponse.json(
      {
        error:
          "The job book is offline just now. Try again, or open a ticket in Discord.",
      },
      { status: 503 },
    );
  }
}
