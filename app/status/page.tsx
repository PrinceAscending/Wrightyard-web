import type { Metadata } from "next";
import { getStatus } from "@/lib/status";
import StatusBoard from "@/components/StatusBoard";
import { ArrowUpRight, DiscordMark } from "@/components/marks";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live status",
  description:
    "The live Wrightyard report: bot uptime, websocket wave, members in the yard, open tickets, and every service named.",
  alternates: { canonical: "/status" },
};

export default async function StatusPage() {
  const status = await getStatus();

  return (
    <>
      <section className="page-hero">
        <div className="shell page-hero__grid">
          <div>
            <p className="kicker">The wire / Live report</p>
            <h1>
              The yard,
              <br />
              in real time.
            </h1>
          </div>
          <div className="page-hero__lede">
            <p>
              No green dashboard theatre. Every number below comes from a signed
              heartbeat, a live Discord call, or a known failure. If a line is
              down, it says so.
            </p>
            <p className="page-hero__stamp">
              Report generated {status.generatedAt.slice(0, 10)} / refreshed
              every thirty seconds
            </p>
          </div>
        </div>
      </section>

      <StatusBoard initial={status} />

      <section className="status-cta">
        <div className="shell status-cta__inner">
          <div>
            <p className="kicker">The gate</p>
            <h2>See the machinery. Then walk in.</h2>
          </div>
          <div className="status-cta__actions">
            <a className="button" href={site.invite} target="_blank" rel="noreferrer">
              <DiscordMark />
              Join the yard
              <ArrowUpRight />
            </a>
            <a className="text-link" href="/#brief">
              Start a job
              <ArrowUpRight />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
