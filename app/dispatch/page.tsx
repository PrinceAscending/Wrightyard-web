import type { Metadata } from "next";
import { listDispatches } from "@/lib/dispatch";
import { site } from "@/lib/site";
import { ArrowUpRight, DiscordMark } from "@/components/marks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dispatches",
  description:
    "The public notice board from Wrightyard: build notes, yard changes, and announcements from the studio.",
  alternates: { canonical: "/dispatch" },
};

function longDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Undated";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function DispatchPage() {
  const dispatches = await listDispatches(30).catch(() => []);

  return (
    <>
      <section className="page-hero">
        <div className="shell page-hero__grid">
          <div>
            <p className="kicker">The front desk / Public notices</p>
            <h1>
              Dispatches
              <br />
              from the yard.
            </h1>
          </div>
          <div className="page-hero__lede">
            <p>
              Announcements, build notes, and changes to the gate. Every notice
              here also ran in Discord. No newsletter, no tracking, no noise.
            </p>
            <p className="page-hero__stamp">
              {dispatches.length > 0
                ? `${dispatches.length} notice${dispatches.length === 1 ? "" : "s"} on file`
                : "No notices on file yet"}
            </p>
          </div>
        </div>
      </section>

      <section className="dispatch">
        <div className="shell">
          {dispatches.length === 0 ? (
            <div className="dispatch-empty">
              <p className="kicker">Notice board</p>
              <h2>The board is waiting for its first mark.</h2>
              <p>
                Announcements posted from the owner&apos;s bench land here as
                well as <code>#announcements</code>. When there is something worth
                saying, it will be filed in this stack.
              </p>
              <a className="text-link" href={site.invite} target="_blank" rel="noreferrer">
                <DiscordMark />
                Read the room
                <ArrowUpRight />
              </a>
            </div>
          ) : (
            <ol className="dispatch-list">
              {dispatches.map((dispatch, index) => (
                <li key={dispatch.id}>
                  <article className="dispatch-entry">
                    <div className="dispatch-entry__meta">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <time dateTime={dispatch.sentAt}>{longDate(dispatch.sentAt)}</time>
                    </div>
                    <h2>{dispatch.title}</h2>
                    <p>{dispatch.message}</p>
                    <div className="dispatch-entry__foot">
                      <span>Filed by the front desk</span>
                      <span>Also in Discord / #announcements</span>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="status-cta">
        <div className="shell status-cta__inner">
          <div>
            <p className="kicker">The gate</p>
            <h2>Notices are public. The work is personal.</h2>
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
