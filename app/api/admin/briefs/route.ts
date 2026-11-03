import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/guards";
import { getBriefStats, listBriefs, setBriefStatus } from "@/lib/briefs";
import { briefUpdateInput } from "@/lib/validation";
import { recordAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireOwnerApi(request, "admin-briefs-read", {
    requireOrigin: false,
  });
  if (!guard.ok) return guard.response;

  try {
    const [briefs, stats] = await Promise.all([listBriefs(40), getBriefStats()]);
    return NextResponse.json(
      { briefs, stats },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("[admin] brief ledger read failed", error);
    return NextResponse.json(
      { error: "The job book is not reachable just now." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const guard = await requireOwnerApi(request, "admin-briefs");
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = briefUpdateInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Unknown brief or status." }, { status: 422 });
  }

  try {
    const brief = await setBriefStatus(parsed.data.id, parsed.data.status);
    if (!brief) {
      return NextResponse.json({ error: "Brief not found." }, { status: 404 });
    }

    await recordAudit(
      guard.session.user.id,
      "brief.status",
      `${brief.reference} moved to ${brief.status}.`,
    );

    return NextResponse.json({ ok: true, brief });
  } catch (error) {
    console.error("[admin] brief status update failed", error);
    return NextResponse.json(
      { error: "The job book did not accept that change." },
      { status: 503 },
    );
  }
}
