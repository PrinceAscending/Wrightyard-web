"use client";

import { useEffect, useState } from "react";
import type { StatusPayload } from "@/lib/status";
import { formatCount, formatPing } from "@/lib/format";
import { ArrowUpRight } from "@/components/marks";

export default function LiveBand() {
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;

    async function load() {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/status", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Status unavailable.");
        const body = (await response.json()) as StatusPayload;
        if (!active) return;
        setStatus(body);
        setFailed(false);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (active) setFailed(true);
      }
    }

    load();
    const timer = window.setInterval(load, 45_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const online = status?.bot.online ?? false;
  const presence = status?.bot.presence || "Waiting for the first heartbeat";

  return (
    <section className="live-band" aria-labelledby="live-band-title">
      <div className="shell live-band__inner">
        <div className="live-band__head">
          <p className="live-band__kicker">
            <span
              className={`live-dot ${online ? "is-live" : ""}`}
              aria-hidden="true"
            />
            Live from the yard
          </p>
          <h2 id="live-band-title">The machinery, right now.</h2>
        </div>

        <dl className="live-band__grid" aria-live="polite">
          <div>
            <dt>The gate</dt>
            <dd>{online ? "Open" : "Quiet"}</dd>
            <p>{online ? "Bot answering" : status ? "Heartbeat away" : "Reading…"}</p>
          </div>
          <div>
            <dt>In the yard</dt>
            <dd>{status ? formatCount(status.guild?.memberCount ?? status.bot.members) : "—"}</dd>
            <p>{status ? `${formatCount(status.guild?.presenceCount ?? 0)} at the rail` : "Reading…"}</p>
          </div>
          <div>
            <dt>Wave</dt>
            <dd>{status ? formatPing(status.bot.ping) : "—"}</dd>
            <p>
              {online && status
                ? `${formatCount(status.bot.commandsServed)} commands served`
                : "No pulse yet"}
            </p>
          </div>
          <div>
            <dt>At the desk</dt>
            <dd className="live-band__presence">{presence}</dd>
            <p>
              {status?.bot.maintenance
                ? "Maintenance gate down"
                : online
                  ? "Taking work"
                  : "Waiting for the line"}
            </p>
          </div>
        </dl>

        <a className="live-band__link" href="/status">
          Read the full log
          <ArrowUpRight />
        </a>

        {failed ? (
          <p className="live-band__error" role="status">
            Live telemetry is between heartbeats. The site is still here.
          </p>
        ) : null}
      </div>
    </section>
  );
}
