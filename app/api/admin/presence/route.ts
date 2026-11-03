import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/guards";
import { presenceInput } from "@/lib/validation";
import { storeDel, storeGet, storeSet } from "@/lib/store";
import { recordAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRESENCE_KEY = "bot:presence-override";

export async function GET(request: NextRequest) {
  const guard = await requireOwnerApi(request, "admin-presence-read");
  if (!guard.ok) return guard.response;

  const override = await storeGet(PRESENCE_KEY);
  return NextResponse.json({ override });
}

export async function POST(request: NextRequest) {
  const guard = await requireOwnerApi(request, "admin-presence");
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = presenceInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Presence text or status is invalid." }, { status: 422 });
  }

  await storeSet(PRESENCE_KEY, parsed.data);
  await recordAudit(
    guard.session.user.id,
    "presence.set",
    `${parsed.data.text} · ${parsed.data.status}`,
  );

  return NextResponse.json({ ok: true, override: parsed.data });
}

export async function DELETE(request: NextRequest) {
  const guard = await requireOwnerApi(request, "admin-presence-clear");
  if (!guard.ok) return guard.response;

  await storeDel(PRESENCE_KEY);
  await recordAudit(guard.session.user.id, "presence.clear", "Presence override cleared.");

  return NextResponse.json({ ok: true, override: null });
}
