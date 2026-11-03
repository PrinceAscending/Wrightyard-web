import { NextRequest, NextResponse } from "next/server";
import { storeDel, storeGet, storeLpush, storeSet } from "@/lib/store";
import { heartbeatInput } from "@/lib/validation";
import { verifyHeartbeatSignature } from "@/lib/security";
import { rateLimit } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEARTBEAT_KEY = "bot:heartbeat";
const HISTORY_KEY = "bot:history";
const PRESENCE_KEY = "bot:presence-override";
const MAINTENANCE_KEY = "bot:maintenance";
const SYNC_KEY = "bot:sync-requested";

type PresenceOverride = {
  text: string;
  status: "online" | "idle" | "dnd" | "invisible";
};

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, "bot-heartbeat", 240, 60);
  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many heartbeats." }, { status: 429 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-wrightyard-signature");

  if (!verifyHeartbeatSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = heartbeatInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid heartbeat payload." },
      { status: 422 },
    );
  }

  const heartbeat = {
    ...parsed.data,
    receivedAt: Date.now(),
  };

  const [presenceOverride, maintenance, syncRequested] = await Promise.all([
    storeGet<PresenceOverride>(PRESENCE_KEY).catch(() => null),
    storeGet<boolean>(MAINTENANCE_KEY).catch(() => null),
    storeGet<boolean>(SYNC_KEY).catch(() => null),
  ]);

  await Promise.all([
    storeSet(HEARTBEAT_KEY, heartbeat, 300),
    storeLpush(
      HISTORY_KEY,
      { t: heartbeat.receivedAt, ping: heartbeat.ping, members: heartbeat.members },
      60,
    ),
  ]);

  if (syncRequested) {
    await storeDel(SYNC_KEY);
  }

  return NextResponse.json(
    {
      ok: true,
      presence: presenceOverride?.text ?? null,
      status: presenceOverride?.status ?? null,
      maintenance: typeof maintenance === "boolean" ? maintenance : null,
      syncCommands: Boolean(syncRequested),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
