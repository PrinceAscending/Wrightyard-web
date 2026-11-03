import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/guards";
import { getTicketStats, listTickets } from "@/lib/tickets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const guard = await requireOwnerApi(request, "admin-tickets-read", {
    requireOrigin: false,
  });
  if (!guard.ok) return guard.response;

  try {
    const [tickets, stats] = await Promise.all([listTickets(30), getTicketStats()]);
    return NextResponse.json(
      { tickets, stats },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("[admin] ticket ledger read failed", error);
    return NextResponse.json(
      { error: "The ticket ledger is not reachable just now." },
      { status: 503 },
    );
  }
}
