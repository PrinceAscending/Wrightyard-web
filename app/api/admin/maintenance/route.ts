import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/guards";
import { maintenanceInput } from "@/lib/validation";
import { storeSet } from "@/lib/store";
import { recordAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAINTENANCE_KEY = "bot:maintenance";

export async function POST(request: NextRequest) {
  const guard = await requireOwnerApi(request, "admin-maintenance");
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = maintenanceInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Maintenance value is invalid." }, { status: 422 });
  }

  await storeSet(MAINTENANCE_KEY, parsed.data.enabled);
  await recordAudit(
    guard.session.user.id,
    "maintenance.toggle",
    parsed.data.enabled ? "Maintenance mode enabled." : "Maintenance mode cleared.",
  );

  return NextResponse.json({ ok: true, enabled: parsed.data.enabled });
}
