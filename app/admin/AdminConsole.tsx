"use client";

import { useCallback, useEffect, useState } from "react";
import type { StatusPayload } from "@/lib/status";
import type { Brief, BriefStats } from "@/lib/briefs";
import type { Ticket, TicketStats } from "@/lib/tickets";
import { briefStatusLabels, briefStatuses, type BriefStatus } from "@/lib/brief-options";
import { ownerCommands } from "@/lib/bot-commands";
import {
  formatClock,
  formatCount,
  formatDate,
  formatPing,
  formatUptime,
} from "@/lib/format";
import { ArrowUpRight } from "@/components/marks";

type AuditEntry = {
  at: string;
  actorId: string;
  action: string;
  summary: string;
};

type Feedback = { tone: "ok" | "error"; text: string } | null;

const actionLabels: Record<string, string> = {
  "presence.set": "Presence set",
  "presence.clear": "Presence cleared",
  "maintenance.toggle": "Maintenance toggled",
  "announcement.send": "Announcement sent",
  "commands.sync": "Command sync queued",
  "brief.status": "Brief moved",
};

const briefFilters = ["all", ...briefStatuses] as const;

function stamp(iso: string) {
  const time = formatClock(iso);
  return time === "—" ? formatDate(iso) : `${formatDate(iso)} / ${time.replace(" UTC", "")}`;
}

export default function AdminConsole({
  initialStatus,
  initialAudit,
  initialBriefs,
  initialBriefStats,
  initialTickets,
  initialTicketStats,
}: {
  initialStatus: StatusPayload;
  initialAudit: AuditEntry[];
  initialBriefs: Brief[];
  initialBriefStats: BriefStats;
  initialTickets: Ticket[];
  initialTicketStats: TicketStats;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [audit, setAudit] = useState(initialAudit);
  const [briefs, setBriefs] = useState(initialBriefs);
  const [briefStats, setBriefStats] = useState(initialBriefStats);
  const [briefFilter, setBriefFilter] = useState<"all" | BriefStatus>("all");
  const [tickets, setTickets] = useState(initialTickets);
  const [ticketStats, setTicketStats] = useState(initialTicketStats);
  const [presenceText, setPresenceText] = useState("");
  const [presenceState, setPresenceState] = useState<
    "online" | "idle" | "dnd" | "invisible"
  >("online");
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceMessage, setAnnounceMessage] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [statusResponse, auditResponse, briefResponse, ticketResponse] =
      await Promise.allSettled([
        fetch("/api/status", { cache: "no-store", credentials: "same-origin" }),
        fetch("/api/admin/audit", { cache: "no-store", credentials: "same-origin" }),
        fetch("/api/admin/briefs", { cache: "no-store", credentials: "same-origin" }),
        fetch("/api/admin/tickets", { cache: "no-store", credentials: "same-origin" }),
      ]).then((results) =>
        results.map((result) => (result.status === "fulfilled" ? result.value : null)),
      );

    if (statusResponse?.ok) {
      setStatus((await statusResponse.json()) as StatusPayload);
    }
    if (auditResponse?.ok) {
      const body = (await auditResponse.json()) as { entries: AuditEntry[] };
      setAudit(body.entries);
    }
    if (briefResponse?.ok) {
      const body = (await briefResponse.json()) as {
        briefs: Brief[];
        stats: BriefStats;
      };
      setBriefs(body.briefs);
      setBriefStats(body.stats);
    }
    if (ticketResponse?.ok) {
      const body = (await ticketResponse.json()) as {
        tickets: Ticket[];
        stats: TicketStats;
      };
      setTickets(body.tickets);
      setTicketStats(body.stats);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(refresh, 20_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  async function request(
    path: string,
    init: RequestInit,
    key: string,
    success: string,
  ) {
    setBusy(key);
    setFeedback(null);
    try {
      const response = await fetch(path, {
        ...init,
        credentials: "same-origin",
        headers: {
          ...(init.body ? { "Content-Type": "application/json" } : {}),
          ...(init.headers ?? {}),
        },
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "The line refused that request.");
      }

      setFeedback({ tone: "ok", text: success });
      await refresh();
      return true;
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "The line dropped that request. Try again.",
      });
      return false;
    } finally {
      setBusy(null);
    }
  }

  function savePresence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = presenceText.trim();
    if (!text) {
      setFeedback({ tone: "error", text: "Give the line something to say." });
      return;
    }
    void request(
      "/api/admin/presence",
      {
        method: "POST",
        body: JSON.stringify({ text, status: presenceState }),
      },
      "presence",
      "Presence override saved. The bot applies it on its next heartbeat.",
    );
  }

  function clearPresence() {
    void request(
      "/api/admin/presence",
      { method: "DELETE" },
      "presence-clear",
      "Presence override cleared. The rotation takes over.",
    );
  }

  function toggleMaintenance() {
    const enabled = !status.bot.maintenance;
    void request(
      "/api/admin/maintenance",
      {
        method: "POST",
        body: JSON.stringify({ enabled }),
      },
      "maintenance",
      enabled
        ? "Maintenance gate down. Ticket opening is paused."
        : "Maintenance gate lifted. The yard is open again.",
    );
  }

  function sendAnnouncement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!announceTitle.trim() || !announceMessage.trim()) {
      setFeedback({
        tone: "error",
        text: "Announcements need both a title and a message.",
      });
      return;
    }

    void (async () => {
      const sent = await request(
        "/api/admin/announce",
        {
          method: "POST",
          body: JSON.stringify({
            title: announceTitle.trim(),
            message: announceMessage.trim(),
          }),
        },
        "announce",
        "Announcement posted to the front desk.",
      );

      if (sent) {
        setAnnounceTitle("");
        setAnnounceMessage("");
      }
    })();
  }

  function requestSync() {
    void request(
      "/api/admin/sync",
      { method: "POST" },
      "sync",
      "Command sync queued. The bot picks it up on its next heartbeat.",
    );
  }

  function updateBrief(brief: Brief, status: BriefStatus) {
    void request(
      "/api/admin/briefs",
      {
        method: "PATCH",
        body: JSON.stringify({ id: brief.id, status }),
      },
      `brief-${brief.id}`,
      `${brief.reference} moved to ${briefStatusLabels[status].toLowerCase()}.`,
    );
  }

  const visibleBriefs =
    briefFilter === "all" ? briefs : briefs.filter((brief) => brief.status === briefFilter);

  return (
    <>
      <dl className="admin-metrics">
        <div>
          <dt>Heartbeat</dt>
          <dd>{status.bot.online ? "Live" : status.bot.stale ? "Stale" : "Waiting"}</dd>
          <p>{formatClock(status.bot.lastSeen)}</p>
        </div>
        <div>
          <dt>Uptime</dt>
          <dd>{formatUptime(status.bot.uptimeSeconds)}</dd>
          <p>Since last restart</p>
        </div>
        <div>
          <dt>Wave</dt>
          <dd>{formatPing(status.bot.ping)}</dd>
          <p>Websocket ping</p>
        </div>
        <div>
          <dt>In the yard</dt>
          <dd>{formatCount(status.bot.members)}</dd>
          <p>{formatCount(status.bot.guilds)} guild connection</p>
        </div>
        <div>
          <dt>Open tickets</dt>
          <dd>{formatCount(status.bot.openTickets)}</dd>
          <p>At the desk</p>
        </div>
        <div>
          <dt>State store</dt>
          <dd>
            {status.store.backend === "mongodb"
              ? "MongoDB"
              : status.store.backend === "upstash"
                ? "Upstash"
                : "Memory"}
          </dd>
          <p>{status.store.durable ? "Durable shared state" : "Add MongoDB for parity"}</p>
        </div>
      </dl>

      {feedback ? (
        <p
          className={`form-feedback form-feedback--${feedback.tone}`}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          {feedback.text}
        </p>
      ) : null}

      <div className="admin-grid">
        <section className="admin-panel" aria-labelledby="admin-presence-title">
          <div className="admin-panel__head">
            <div>
              <p className="kicker">Presence</p>
              <h2 id="admin-presence-title">What the yard sees.</h2>
            </div>
            <span className="admin-panel__tag">Rotation override</span>
          </div>

          <p className="admin-panel__intro">
            Set a line and a state. It outranks the rotating presence until you
            clear it or the bot restarts with a fresh contract.
          </p>

          <form className="admin-form" onSubmit={savePresence}>
            <div className="form-field">
              <label htmlFor="admin-presence-text">Line</label>
              <input
                id="admin-presence-text"
                name="presence"
                type="text"
                maxLength={128}
                placeholder={status.bot.presence || "Watching the quiet machinery"}
                value={presenceText}
                onChange={(event) => setPresenceText(event.target.value)}
              />
              <span className="form-hint">{presenceText.length}/128</span>
            </div>

            <div className="form-field form-field--short">
              <label htmlFor="admin-presence-state">State</label>
              <select
                id="admin-presence-state"
                name="state"
                value={presenceState}
                onChange={(event) =>
                  setPresenceState(
                    event.target.value as "online" | "idle" | "dnd" | "invisible",
                  )
                }
              >
                <option value="online">Online</option>
                <option value="idle">Idle</option>
                <option value="dnd">Do not disturb</option>
                <option value="invisible">Invisible</option>
              </select>
            </div>

            <div className="admin-actions">
              <button
                className="button button--small"
                type="submit"
                disabled={busy === "presence"}
              >
                {busy === "presence" ? "Setting…" : "Set override"}
              </button>
              <button
                className="text-link text-link--button"
                type="button"
                onClick={clearPresence}
                disabled={busy === "presence-clear"}
              >
                {busy === "presence-clear" ? "Clearing…" : "Clear override"}
              </button>
            </div>
          </form>

          <p className="admin-panel__foot">
            Currently reporting: <strong>{status.bot.presence}</strong>
          </p>
        </section>

        <section className="admin-panel" aria-labelledby="admin-maintenance-title">
          <div className="admin-panel__head">
            <div>
              <p className="kicker">Maintenance</p>
              <h2 id="admin-maintenance-title">The gate, on purpose.</h2>
            </div>
            <span className="admin-panel__tag">Ticket switch</span>
          </div>

          <div
            className={`maintenance-state ${
              status.bot.maintenance ? "is-on" : ""
            }`}
          >
            <span
              className={`live-dot ${status.bot.maintenance ? "is-live" : ""}`}
              aria-hidden="true"
            />
            <div>
              <p className="dash-label">Gate state</p>
              <strong>
                {status.bot.maintenance ? "Down for maintenance" : "Open for work"}
              </strong>
            </div>
          </div>

          <p className="admin-panel__intro">
            While the gate is down, ticket opening is refused with a polite
            note. The bot stays online and keeps reporting. Nothing is deleted.
          </p>

          <div className="admin-actions">
            <button
              className={`button button--small ${
                status.bot.maintenance ? "button--paper" : ""
              }`}
              type="button"
              onClick={toggleMaintenance}
              disabled={busy === "maintenance"}
            >
              {busy === "maintenance"
                ? "Toggling…"
                : status.bot.maintenance
                  ? "Lift maintenance"
                  : "Take the gate down"}
            </button>
          </div>

          <p className="admin-panel__foot">
            Heartbeats continue. Presence drops to idle while the gate is down.
          </p>
        </section>
      </div>

      <section className="admin-panel admin-panel--wide" aria-labelledby="admin-announce-title">
        <div className="admin-panel__head">
          <div>
            <p className="kicker">Announcement</p>
            <h2 id="admin-announce-title">Post to the front desk.</h2>
          </div>
          <span className="admin-panel__tag">Discord REST / live</span>
        </div>

        <p className="admin-panel__intro">
          This goes straight to <code>#announcements</code> through the Discord
          API. No gateway needed. The embed carries the studio mark and no
          mentions.
        </p>

        <form className="admin-form admin-form--announce" onSubmit={sendAnnouncement}>
          <div className="form-field">
            <label htmlFor="admin-announce-title">Title</label>
            <input
              id="admin-announce-title"
              name="title"
              type="text"
              maxLength={100}
              placeholder="The yard is open"
              value={announceTitle}
              onChange={(event) => setAnnounceTitle(event.target.value)}
            />
            <span className="form-hint">{announceTitle.length}/100</span>
          </div>

          <div className="form-field form-field--wide">
            <label htmlFor="admin-announce-message">Message</label>
            <textarea
              id="admin-announce-message"
              name="message"
              rows={6}
              maxLength={1800}
              placeholder="A build landed. A gate changed. A thing worth saying."
              value={announceMessage}
              onChange={(event) => setAnnounceMessage(event.target.value)}
            />
            <span className="form-hint">{announceMessage.length}/1800</span>
          </div>

          <div className="admin-actions">
            <button
              className="button button--small"
              type="submit"
              disabled={busy === "announce"}
            >
              {busy === "announce" ? "Posting…" : "Post announcement"}
            </button>
            <span className="admin-panel__foot">
              Signed-in owner only. Rate limited. No mentions.
            </span>
          </div>
        </form>
      </section>

      <section className="admin-panel admin-panel--wide" aria-labelledby="admin-briefs-title">
        <div className="admin-panel__head">
          <div>
            <p className="kicker">Job book / MongoDB</p>
            <h2 id="admin-briefs-title">Briefs on the bench.</h2>
          </div>
          <span className="admin-panel__tag">
            {briefStats.new} new / {briefStats.total} on file
          </span>
        </div>

        <p className="admin-panel__intro">
          Every brief sent from the website is written to MongoDB before the
          sender gets a receipt. Move it through the book here; the public page
          only ever sees the job, never the contact details.
        </p>

        <div className="ledger-stats" aria-label="Brief counts">
          <div>
            <span>Total</span>
            <strong>{formatCount(briefStats.total)}</strong>
          </div>
          <div>
            <span>New</span>
            <strong>{formatCount(briefStats.new)}</strong>
          </div>
          <div>
            <span>Reviewing</span>
            <strong>{formatCount(briefStats.reviewing)}</strong>
          </div>
          <div>
            <span>Quoted</span>
            <strong>{formatCount(briefStats.quoted)}</strong>
          </div>
          <div>
            <span>Won</span>
            <strong>{formatCount(briefStats.won)}</strong>
          </div>
          <div>
            <span>Archived</span>
            <strong>{formatCount(briefStats.archived)}</strong>
          </div>
        </div>

        <div className="brief-filters" role="group" aria-label="Filter the job book">
          {briefFilters.map((filter) => (
            <button
              key={filter}
              className={`brief-filter${briefFilter === filter ? " is-on" : ""}`}
              type="button"
              aria-pressed={briefFilter === filter}
              onClick={() => setBriefFilter(filter)}
            >
              {filter === "all" ? "All" : briefStatusLabels[filter]}
              {filter !== "all" ? ` ${briefStats[filter]}` : ` ${briefStats.total}`}
            </button>
          ))}
        </div>

        {visibleBriefs.length === 0 ? (
          <p className="dash-empty">
            {briefs.length === 0
              ? "No briefs on file yet. The website job form writes its first mark here."
              : "No briefs in this column."}
          </p>
        ) : (
          <ul className="brief-ledger">
            {visibleBriefs.map((brief) => (
              <li
                key={brief.id}
                className={`brief-ledger__item brief-ledger__item--${brief.status}`}
              >
                <div className="brief-ledger__head">
                  <span className="brief-ledger__ref">{brief.reference}</span>
                  <span className={`brief-status brief-status--${brief.status}`}>
                    {briefStatusLabels[brief.status]}
                  </span>
                  <time dateTime={brief.createdAt}>{stamp(brief.createdAt)}</time>
                </div>

                <div className="brief-ledger__body">
                  <h3>{brief.name}</h3>
                  <p className="brief-ledger__spec">
                    {brief.service} / {brief.timeline}
                  </p>
                  <p className="brief-ledger__notes">{brief.notes}</p>
                </div>

                <div className="brief-ledger__foot">
                  <span>{brief.contact || "No contact given"}</span>
                  <span>
                    {brief.username
                      ? `Signed in as ${brief.username}`
                      : "Anonymous / not signed in"}
                  </span>
                </div>

                <div className="brief-ledger__actions">
                  <label htmlFor={`brief-status-${brief.id}`}>Move</label>
                  <select
                    id={`brief-status-${brief.id}`}
                    value={brief.status}
                    disabled={busy === `brief-${brief.id}`}
                    onChange={(event) =>
                      updateBrief(brief, event.target.value as BriefStatus)
                    }
                  >
                    {briefStatuses.map((status) => (
                      <option key={status} value={status}>
                        {briefStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-panel admin-panel--wide" aria-labelledby="admin-tickets-title">
        <div className="admin-panel__head">
          <div>
            <p className="kicker">Ticket ledger / MongoDB</p>
            <h2 id="admin-tickets-title">The desk, on file.</h2>
          </div>
          <span className="admin-panel__tag">
            {ticketStats.open} open / {ticketStats.recent} this week
          </span>
        </div>

        <p className="admin-panel__intro">
          The bot writes ticket openings, claims, closures, and removals to the
          shared database. This is the durable history the channel topics cannot
          lose. Deleted rooms keep their ledger entry.
        </p>

        <div className="ledger-stats" aria-label="Ticket counts">
          <div>
            <span>On file</span>
            <strong>{formatCount(ticketStats.total)}</strong>
          </div>
          <div>
            <span>Open</span>
            <strong>{formatCount(ticketStats.open)}</strong>
          </div>
          <div>
            <span>Closed</span>
            <strong>{formatCount(ticketStats.closed)}</strong>
          </div>
          <div>
            <span>Removed</span>
            <strong>{formatCount(ticketStats.deleted)}</strong>
          </div>
          <div>
            <span>Last 7 days</span>
            <strong>{formatCount(ticketStats.recent)}</strong>
          </div>
        </div>

        {tickets.length === 0 ? (
          <p className="dash-empty">
            No ticket records yet. Open a ticket in Discord and the bot writes
            the first entry here.
          </p>
        ) : (
          <ul className="ticket-ledger">
            {tickets.map((ticket) => (
              <li key={ticket.channelId}>
                <span className="ticket-ledger__number">
                  #{String(ticket.number).padStart(4, "0")}
                </span>
                <div className="ticket-ledger__who">
                  <strong>{ticket.openerTag || ticket.openerId}</strong>
                  <p>
                    {ticket.channelName || "private room"} / opened{" "}
                    {stamp(ticket.openedAt)}
                  </p>
                </div>
                <span className={`brief-status brief-status--ticket-${ticket.status}`}>
                  {ticket.status}
                </span>
                {ticket.status === "deleted" ? (
                  <span className="ticket-ledger__gone">Removed</span>
                ) : (
                  <a
                    className="text-link"
                    href={`https://discord.com/channels/${ticket.guildId}/${ticket.channelId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open room
                    <ArrowUpRight />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="admin-grid admin-grid--lower">
        <section className="admin-panel" aria-labelledby="admin-sync-title">
          <div className="admin-panel__head">
            <div>
              <p className="kicker">Commands</p>
              <h2 id="admin-sync-title">Re-register the set.</h2>
            </div>
            <span className="admin-panel__tag">Guild scope</span>
          </div>

          <p className="admin-panel__intro">
            Queue a command sync on the next heartbeat. Guild-scoped commands
            update immediately; global commands can take an hour to surface.
          </p>

          <div className="admin-actions">
            <button
              className="button button--small"
              type="button"
              onClick={requestSync}
              disabled={busy === "sync"}
            >
              {busy === "sync" ? "Queueing…" : "Queue command sync"}
            </button>
          </div>

          <div className="contract-note">
            <p className="dash-label">Heartbeat contract</p>
            <code>POST /api/bot/heartbeat</code>
            <code>x-wrightyard-signature: HMAC-SHA256</code>
            <code>Every 30 seconds / 10s timeout</code>
          </div>
        </section>

        <section className="admin-panel" aria-labelledby="admin-audit-title">
          <div className="admin-panel__head">
            <div>
              <p className="kicker">Marks</p>
              <h2 id="admin-audit-title">The last twenty.</h2>
            </div>
            <span className="admin-panel__tag">Owner actions</span>
          </div>

          {audit.length === 0 ? (
            <p className="dash-empty">
              No marks yet. Every owner action writes one here.
            </p>
          ) : (
            <ul className="audit-list">
              {audit.map((entry) => (
                <li key={`${entry.at}-${entry.action}-${entry.summary}`}>
                  <div>
                    <span className="audit-list__action">
                      {actionLabels[entry.action] ?? entry.action}
                    </span>
                    <span className="audit-list__time">
                      {formatClock(entry.at)}
                    </span>
                  </div>
                  <p>{entry.summary}</p>
                  <span className="audit-list__actor">
                    {entry.actorId.slice(-6)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="admin-panel admin-panel--wide" aria-labelledby="admin-commands-title">
        <div className="admin-panel__head">
          <div>
            <p className="kicker">Owner commands</p>
            <h2 id="admin-commands-title">In the room, too.</h2>
          </div>
          <a className="text-link" href="/status">
            Live status
            <ArrowUpRight />
          </a>
        </div>

        <ul className="owner-command-list">
          {ownerCommands.map((command) => (
            <li key={command.name}>
              <code>{command.name}</code>
              <p>{command.description}</p>
            </li>
          ))}
        </ul>

        <p className="admin-panel__foot">
          Every subcommand re-checks your Discord user ID at runtime. Server
          administrator does not imply owner.
        </p>
      </section>
    </>
  );
}
