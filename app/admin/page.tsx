import type { Metadata } from "next";
import { requireOwnerPage } from "@/lib/guards";
import { getStatus } from "@/lib/status";
import { getAuditLog } from "@/lib/audit";
import { getBriefStats, listBriefs, type BriefStats } from "@/lib/briefs";
import { getTicketStats, listTickets, type TicketStats } from "@/lib/tickets";
import { displayName } from "@/lib/auth";
import AdminConsole from "./AdminConsole";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Owner's bench",
  description: "Private controls for the Wrightyard line.",
  robots: { index: false, follow: false },
};

const emptyBriefStats: BriefStats = {
  total: 0,
  new: 0,
  reviewing: 0,
  quoted: 0,
  won: 0,
  archived: 0,
};

const emptyTicketStats: TicketStats = {
  total: 0,
  open: 0,
  closed: 0,
  deleted: 0,
  recent: 0,
};

export default async function AdminPage() {
  const session = await requireOwnerPage();
  const [status, audit, briefs, briefStats, tickets, ticketStats] = await Promise.all([
    getStatus(),
    getAuditLog(20),
    listBriefs(40).catch(() => []),
    getBriefStats().catch(() => emptyBriefStats),
    listTickets(30).catch(() => []),
    getTicketStats().catch(() => emptyTicketStats),
  ]);

  return (
    <section className="admin">
      <div className="shell">
        <div className="admin__top">
          <div>
            <p className="kicker">Owner&apos;s bench / Private</p>
            <h1>
              The bench.
              <span className="account__stop">.</span>
            </h1>
            <p className="admin__lede">
              Signed in as {displayName(session.user)}. Every control here
              reaches the gateway bot through a signed heartbeat or the Discord
              API. Nothing is cosmetic.
            </p>
          </div>
          <div className="admin__seal" aria-hidden="true">
            <span>Owner</span>
            <strong>{session.user.id.slice(-6)}</strong>
            <span>Wrightyard</span>
          </div>
        </div>

        <AdminConsole
          initialStatus={status}
          initialAudit={audit}
          initialBriefs={briefs}
          initialBriefStats={briefStats}
          initialTickets={tickets}
          initialTicketStats={ticketStats}
        />
      </div>
    </section>
  );
}
