import { NextResponse } from "next/server";
import { getStatus } from "@/lib/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getStatus();
  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
