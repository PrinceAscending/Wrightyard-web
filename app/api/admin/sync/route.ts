import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/guards";
import { storeSet } from "@/lib/store";
import { recordAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYNC_KEY = "bot:sync-requested";

export async function POST(request: NextRequest) {
  const guard = await requireOwnerApi(request, "admin-sync");
  if (!guard.ok) return guard.response;

  await storeSet(SYNC_KEY, true, 600);
  await recordAudit(
    guard.session.user.id,
    "commands.sync",
    "Command sync requested; the bot picks it up on its next heartbeat.",
  );

  return NextResponse.json({
    ok: true,
    queued: true,
    note: "The gateway bot will re-register its commands on the next heartbeat.",
  });
}
