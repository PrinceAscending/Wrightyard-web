"use client";

import { useCallback, useEffect, useState } from "react";
import type { HistoryPoint, ServiceStatus, StatusPayload } from "@/lib/status";
import {
  formatClock,
  formatCount,
  formatPing,
  formatUptime,
} from "@/lib/format";
import { ArrowUpRight } from "@/components/marks";

const overallCopy: Record<
  StatusPayload["overall"],
  { word: string; note: string }
> = {
  operational: {
    word: "Operational",
    note: "The site is up, the bot is answering, and the yard is open.",
  },
  degraded: {
    word: "Degraded",
    note: "Something is between heartbeats. The work continues; the signal is thin.",
  },
  outage: {
    word: "Outage",
    note: "The line is down. We are looking at it, not around it.",
  },
};

const serviceCopy: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  offline: "Offline",
  unknown: "Unverified",
};

function Sparkline({ history }: { history: HistoryPoint[] }) {
  if (history.length < 2) {
    return (
      <div className="spark-empty">
        <p>Waiting for a second heartbeat.</p>
        <span>The line draws itself every thirty seconds.</span>
      </div>
    );
  }

  const width = 560;
  const height = 150;
  const pad = 12;
  const pings = history.map((point) => point.ping);
  const min = Math.min(...pings);
  const max = Math.max(...pings);
  const range = Math.max(1, max - min);
  const points = history
    .map((point, index) => {
      const x = pad + (index / (history.length - 1)) * (width - pad * 2);
      const y = height - pad - ((point.ping - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = history[history.length - 1];

  return (
    <figure className="spark">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Websocket ping over the last ${history.length} heartbeats. Latest ${Math.round(last.ping)} milliseconds.`}
      >
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={pad}
            x2={width - pad}
            y1={pad + ratio * (height - pad * 2)}
            y2={pad + ratio * (height - pad * 2)}
          />
        ))}
        <polyline className="spark__line" points={points} />
        <circle
          className="spark__end"
          cx={width - pad}
          cy={
            height -
            pad -
            ((last.ping - min) / range) * (height - pad * 2)
          }
          r="3.5"
        />
      </svg>
      <figcaption>
        <span>Websocket wave / last {history.length} beats</span>
        <span>
          {formatPing(min)}–{formatPing(max)}
        </span>
      </figcaption>
    </figure>
  );
}

export default function StatusBoard({ initial }: { initial: StatusPayload }) {
  const [status, setStatus] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/status", { cache: "no-store" });
      if (!response.ok) throw new Error("Status unavailable.");
      const body = (await response.json()) as StatusPayload;
      setStatus(body);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(refresh, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const summary = overallCopy[status.overall];
  const heartbeat = status.bot.lastSeen
    ? formatClock(status.bot.lastSeen)
    : "No heartbeat yet";

  return (
    <section className="status-board" aria-labelledby="status-board-title">
      <div className="shell">
        <div className="status-board__top">
          <div className={`status-state status-state--${status.overall}`}>
            <p className="status-state__label">
              <span aria-hidden="true" />
              Yard report
            </p>
            <h2 id="status-board-title">{summary.word}</h2>
            <p className="status-state__note">{summary.note}</p>
          </div>

          <div className="status-board__meta">
            <dl>
              <div>
                <dt>Last heartbeat</dt>
                <dd>{heartbeat}</dd>
              </div>
              <div>
                <dt>Snapshot</dt>
                <dd>{formatClock(status.generatedAt)}</dd>
              </div>
              <div>
                <dt>Bot build</dt>
                <dd>{status.bot.version ? `v${status.bot.version}` : "Not reported"}</dd>
              </div>
            </dl>
            <button
              className="button button--small"
              type="button"
              onClick={refresh}
              disabled={refreshing}
            >
              {refreshing ? "Reading the line…" : "Refresh"}
            </button>
          </div>
        </div>

        {status.bot.maintenance ? (
          <div className="maintenance-banner" role="status">
            <strong>Maintenance gate down.</strong>
            <span>
              The yard is being worked on. Tickets are paused until the gate
              lifts.
            </span>
          </div>
        ) : null}

        {failed ? (
          <p className="status-note status-note--warning" role="status">
            The last refresh did not land. Showing the previous snapshot; the
            line will retry in thirty seconds.
          </p>
        ) : null}

        <dl className="status-metrics">
          <div>
            <dt>Uptime</dt>
            <dd>{formatUptime(status.bot.uptimeSeconds)}</dd>
            <p>Since the last restart</p>
          </div>
          <div>
            <dt>Wave</dt>
            <dd>{formatPing(status.bot.ping)}</dd>
            <p>Websocket ping</p>
          </div>
          <div>
            <dt>In the yard</dt>
            <dd>{formatCount(status.bot.members)}</dd>
            <p>{formatCount(status.guild?.presenceCount ?? 0)} at the rail</p>
          </div>
          <div>
            <dt>Commands</dt>
            <dd>{formatCount(status.bot.commandsServed)}</dd>
            <p>Served this run</p>
          </div>
          <div>
            <dt>Open tickets</dt>
            <dd>{formatCount(status.bot.openTickets)}</dd>
            <p>At the front desk</p>
          </div>
          <div>
            <dt>Memory</dt>
            <dd>{Math.round(status.bot.memoryMb)} MB</dd>
            <p>Process footprint</p>
          </div>
        </dl>

        <div className="status-columns">
          <div className="status-services">
            <div className="status-block__head">
              <div>
                <p className="kicker">The line</p>
                <h3>Every service, named</h3>
              </div>
              <a className="text-link" href={status.guild ? "/#yard" : "/#brief"}>
                {status.guild ? "Walk the yard" : "Start a job"}
                <ArrowUpRight />
              </a>
            </div>

            <ul className="service-list">
              {status.services.map((service) => (
                <li key={service.name}>
                  <span className="service-list__name">{service.name}</span>
                  <span
                    className={`service-chip service-chip--${service.status}`}
                  >
                    <span aria-hidden="true" />
                    {serviceCopy[service.status]}
                  </span>
                  <p>{service.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="status-wave">
            <div className="status-block__head">
              <div>
                <p className="kicker">The pulse</p>
                <h3>Six beats at a time</h3>
              </div>
            </div>
            <Sparkline history={status.history} />
            <div className="status-wave__foot">
              <p>
                Presence: <strong>{status.bot.presence}</strong>
              </p>
              <p>
                State store:{" "}
                <strong>
                  {status.store.backend === "mongodb"
                    ? "Durable / MongoDB"
                    : status.store.backend === "upstash"
                      ? "Durable / Upstash"
                      : "In-memory fallback"}
                </strong>
              </p>
            </div>
            {!status.store.durable ? (
              <p className="status-note">
                Add MongoDB Atlas to keep the heartbeat, briefs, and ticket
                ledger across instances and deployments.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
