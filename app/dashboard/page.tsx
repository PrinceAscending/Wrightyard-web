import type { Metadata } from "next";
import { requireDashboardSession } from "@/lib/guards";
import { avatarUrl, displayName, isOwner } from "@/lib/auth";
import { getGuildMember, getGuildRoles } from "@/lib/discord";
import { getStatus } from "@/lib/status";
import { listBriefsForUser } from "@/lib/briefs";
import { listTicketsForUser } from "@/lib/tickets";
import { briefStatusLabels } from "@/lib/brief-options";
import { formatCount, formatDate, formatPing, formatUptime } from "@/lib/format";
import { publicCommands } from "@/lib/bot-commands";
import { channelUrl, site } from "@/lib/site";
import SignOutButton from "@/components/SignOutButton";
import { ArrowUpRight, DiscordMark, Wordmark } from "@/components/marks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Member file",
  description: "Your Wrightyard member file and the live yard report.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await requireDashboardSession();
  const owner = isOwner(session.user.id);

  const [member, roles, status, briefs, tickets] = await Promise.all([
    getGuildMember(session.user.id),
    getGuildRoles(),
    getStatus(),
    listBriefsForUser(session.user.id, 5).catch(() => []),
    listTicketsForUser(session.user.id, 5).catch(() => []),
  ]);

  const memberRoleIds = new Set(member?.roles ?? []);
  const memberRoles = roles.filter(
    (role) =>
      memberRoleIds.has(role.id) &&
      role.id !== status.guild?.id &&
      role.name !== "@everyone",
  );
  const name = displayName(session.user);
  const avatar = avatarUrl(session.user, 256);

  return (
    <section className="account">
      <div className="shell">
        <div className="account__top">
          <div>
            <p className="kicker">Member file / The yard</p>
            <h1>
              {name}
              <span className="account__stop">.</span>
            </h1>
            <p className="account__lede">
              This is your file, not a feed. Your seat in the yard, the live
              line, and the commands worth knowing.
            </p>
          </div>

          <div className="account__stamp" aria-hidden="true">
            <Wordmark />
            <span>{owner ? "Owner's copy" : "Member's copy"}</span>
            <span>No. {session.user.id.slice(-6)}</span>
          </div>
        </div>

        <div className="dashboard-grid">
          <article className="dash-card dash-card--file">
            <div className="dash-card__head">
              <span>Member file</span>
              <span>Wrightyard / Yard 001</span>
            </div>

            <div className="member-row">
              <img
                className="member-row__avatar"
                src={avatar}
                alt=""
                width={88}
                height={88}
              />
              <div>
                <h2>{name}</h2>
                <p>@{session.user.username}</p>
                {owner ? <span className="owner-stamp">Owner</span> : null}
              </div>
            </div>

            <dl className="file-rows">
              <div>
                <dt>Discord ID</dt>
                <dd>{session.user.id}</dd>
              </div>
              <div>
                <dt>Yard status</dt>
                <dd>
                  {member ? (
                    <>
                      <span className="status-dot" aria-hidden="true" />
                      On the crew ledger
                    </>
                  ) : (
                    "No yard file found"
                  )}
                </dd>
              </div>
              <div>
                <dt>Joined yard</dt>
                <dd>{member ? formatDate(member.joinedAt) : "—"}</dd>
              </div>
              <div>
                <dt>Session</dt>
                <dd>Signed / expires {formatDate(new Date(session.exp * 1000).toISOString())}</dd>
              </div>
            </dl>

            <div className="role-block">
              <p className="dash-label">Crew marks</p>
              {memberRoles.length > 0 ? (
                <ul className="role-chips">
                  {memberRoles.map((role) => (
                    <li
                      key={role.id}
                      style={
                        role.color
                          ? {
                              borderColor: `#${role.color
                                .toString(16)
                                .padStart(6, "0")}`,
                            }
                          : undefined
                      }
                    >
                      {role.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="dash-empty">
                  {member
                    ? "No crew marks yet. Pick a role in #roles."
                    : "Join the yard to be written into the ledger."}
                </p>
              )}
            </div>

            <div className="dash-card__actions">
              <a className="text-link" href={site.invite} target="_blank" rel="noreferrer">
                <DiscordMark />
                {member ? "Open the yard" : "Join the yard"}
                <ArrowUpRight />
              </a>
              <SignOutButton />
            </div>
          </article>

          <article className="dash-card dash-card--live">
            <div className="dash-card__head">
              <span>Live line</span>
              <span>{status.bot.online ? "Pulse found" : "No pulse"}</span>
            </div>

            <div className="live-state">
              <span
                className={`live-dot ${status.bot.online ? "is-live" : ""}`}
                aria-hidden="true"
              />
              <div>
                <p className="dash-label">Bot / Wrightyard</p>
                <h2>{status.bot.online ? "At the desk" : "Between beats"}</h2>
              </div>
            </div>

            <dl className="live-rows">
              <div>
                <dt>Uptime</dt>
                <dd>{formatUptime(status.bot.uptimeSeconds)}</dd>
              </div>
              <div>
                <dt>Wave</dt>
                <dd>{formatPing(status.bot.ping)}</dd>
              </div>
              <div>
                <dt>In the yard</dt>
                <dd>{formatCount(status.bot.members)}</dd>
              </div>
              <div>
                <dt>Open tickets</dt>
                <dd>{formatCount(status.bot.openTickets)}</dd>
              </div>
            </dl>

            <p className="presence-line">
              <span className="dash-label">Presently</span>
              {status.bot.presence}
            </p>

            {status.bot.maintenance ? (
              <p className="status-note status-note--warning" role="status">
                Maintenance gate down. Tickets are paused.
              </p>
            ) : null}

            <div className="dash-card__actions">
              <a className="text-link" href="/status">
                Full status report
                <ArrowUpRight />
              </a>
              {owner ? (
                <a className="text-link" href="/admin">
                  Owner&apos;s bench
                  <ArrowUpRight />
                </a>
              ) : null}
            </div>
          </article>
        </div>

        <div className="dashboard-grid dashboard-grid--lower">
          <article className="dash-card">
            <div className="dash-card__head">
              <span>Next moves</span>
              <span>Three doors</span>
            </div>
            <ul className="door-list">
              <li>
                <a href={site.invite} target="_blank" rel="noreferrer">
                  <span>01</span>
                  <strong>Start a job</strong>
                  <em>Bring the thing. We reply with a scope and a date.</em>
                  <ArrowUpRight />
                </a>
              </li>
              <li>
                <a
                  href={channelUrl(site.rulesChannelId)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>02</span>
                  <strong>Read the rules</strong>
                  <em>Nine rules, written plainly, kept short.</em>
                  <ArrowUpRight />
                </a>
              </li>
              <li>
                <a href="/status">
                  <span>03</span>
                  <strong>Watch the line</strong>
                  <em>Uptime, wave, tickets, and the honest state store.</em>
                  <ArrowUpRight />
                </a>
              </li>
            </ul>
          </article>

          <article className="dash-card">
            <div className="dash-card__head">
              <span>Command index</span>
              <span>Everyone</span>
            </div>
            <ul className="command-list">
              {publicCommands.map((command) => (
                <li key={command.name}>
                  <code>{command.name}</code>
                  <p>{command.description}</p>
                </li>
              ))}
            </ul>
            <p className="dash-note">
              You get <strong>Crew</strong> on entry. Talk in the yard to climb{" "}
              {site.levelRoles.map((role) => role.name).join(" → ")}. The full
              ladder is in the{" "}
              <a href={channelUrl(site.rolesChannelId)} target="_blank" rel="noreferrer">
                role ledger
              </a>
              .
            </p>
            {owner ? (
              <p className="dash-note">
                Owner commands are listed on the{" "}
                <a href="/admin">bench</a>.
              </p>
            ) : null}
          </article>
        </div>

        <div className="dashboard-grid dashboard-grid--lower">
          <article className="dash-card">
            <div className="dash-card__head">
              <span>Job book</span>
              <span>{briefs.length > 0 ? `${briefs.length} on file` : "MongoDB / private"}</span>
            </div>

            {briefs.length === 0 ? (
              <p className="dash-empty">
                No briefs on file yet. Send one from the{" "}
                <a href="/#brief">job form</a> and it will appear here with a
                reference.
              </p>
            ) : (
              <ul className="member-file-list">
                {briefs.map((brief) => (
                  <li key={brief.id}>
                    <div>
                      <span className="dash-label">
                        {brief.reference} / {formatDate(brief.createdAt)}
                      </span>
                      <strong>
                        {brief.service} / {brief.timeline}
                      </strong>
                      <p>
                        {brief.notes.length > 140
                          ? `${brief.notes.slice(0, 140).trimEnd()}…`
                          : brief.notes}
                      </p>
                    </div>
                    <span className={`brief-status brief-status--${brief.status}`}>
                      {briefStatusLabels[brief.status]}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="dash-card__actions">
              <a className="text-link" href="/#brief">
                Start another job
                <ArrowUpRight />
              </a>
            </div>
          </article>

          <article className="dash-card">
            <div className="dash-card__head">
              <span>Ticket file</span>
              <span>{tickets.length > 0 ? `${tickets.length} on file` : "MongoDB / private"}</span>
            </div>

            {tickets.length === 0 ? (
              <p className="dash-empty">
                No ticket records yet. Open a private room in Discord and the bot
                writes it to your file here.
              </p>
            ) : (
              <ul className="member-file-list">
                {tickets.map((ticket) => (
                  <li key={ticket.channelId}>
                    <div>
                      <span className="dash-label">
                        #{String(ticket.number).padStart(4, "0")} /{" "}
                        {formatDate(ticket.openedAt)}
                      </span>
                      <strong>{ticket.channelName || "Private room"}</strong>
                      <p>
                        {ticket.status === "open"
                          ? ticket.claimedById
                            ? "Claimed by the studio"
                            : "Waiting at the desk"
                          : ticket.status === "closed"
                            ? `Closed ${formatDate(ticket.closedAt)}`
                            : `Removed ${formatDate(ticket.deletedAt)}`}
                      </p>
                    </div>
                    <span
                      className={`brief-status brief-status--ticket-${ticket.status}`}
                    >
                      {ticket.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="dash-card__actions">
              <a className="text-link" href={site.invite} target="_blank" rel="noreferrer">
                <DiscordMark />
                Open a ticket
                <ArrowUpRight />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
