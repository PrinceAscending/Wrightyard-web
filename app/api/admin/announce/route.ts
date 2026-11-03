import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/guards";
import { announcementInput } from "@/lib/validation";
import { sendAnnouncement } from "@/lib/discord";
import { recordAudit } from "@/lib/audit";
import { saveDispatch } from "@/lib/dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const guard = await requireOwnerApi(request, "admin-announce");
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = announcementInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Announcements need a title (100 characters) and a message (1,800 characters)." },
      { status: 422 },
    );
  }

  try {
    const message = await sendAnnouncement(parsed.data.title, parsed.data.message);
    let archived = false;

    try {
      await saveDispatch({
        title: parsed.data.title,
        message: parsed.data.message,
        messageId: message.id,
        channelId: message.channel_id,
        actorId: guard.session.user.id,
      });
      archived = true;
    } catch (error) {
      console.warn("[admin] announcement archive write failed", error);
    }

    await recordAudit(
      guard.session.user.id,
      "announcement.send",
      `${parsed.data.title} · ${message.id}${archived ? " · archived" : ""}`,
    );

    return NextResponse.json({
      ok: true,
      messageId: message.id,
      channelId: message.channel_id,
      archived,
    });
  } catch (error) {
    console.error("[admin] announcement failed", error);
    return NextResponse.json(
      { error: "Discord did not accept the announcement. Check the bot token and channel." },
      { status: 502 },
    );
  }
}
