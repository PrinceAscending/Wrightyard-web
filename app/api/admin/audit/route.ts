import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/guards";
import { getAuditLog } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireOwnerApi(request, "admin-audit-read", {
    requireOrigin: false,
  });
  if (!guard.ok) return guard.response;

  const entries = await getAuditLog(20);
  return NextResponse.json(
    { entries },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
