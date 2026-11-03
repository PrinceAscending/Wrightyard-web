"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { briefServices, briefTimelines } from "@/lib/brief-options";
import { ArrowUpRight, CheckIcon, CopyIcon, DiscordMark } from "@/components/marks";

const services = [...briefServices];
const timelines = [...briefTimelines];

type SubmitState = "idle" | "sending" | "done" | "error";

function fallbackCopy(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-1000px";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(area);
  if (!ok) throw new Error("Copy failed");
}

export default function BriefBuilder() {
  const [service, setService] = useState<string>(services[0]);
  const [timeline, setTimeline] = useState<string>(timelines[1]);
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [trap, setTrap] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");

  const brief = [
    "JOB REQUEST — WRIGHTYARD",
    `Build: ${service}`,
    `Timeline: ${timeline}`,
    `Name: ${name.trim() || "—"}`,
    `Contact: ${contact.trim() || "—"}`,
    `Notes: ${notes.trim() || "—"}`,
  ].join("\n");

  async function copyBrief() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(brief);
      } else {
        fallbackCopy(brief);
      }
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2600);
    } catch {
      try {
        fallbackCopy(brief);
        setCopyState("copied");
        window.setTimeout(() => setCopyState("idle"), 2600);
      } catch {
        setCopyState("error");
      }
    }
  }

  async function sendBrief() {
    setSubmitError("");

    if (name.trim().length < 2) {
      setSubmitError("Add a name so the bench knows who is asking.");
      return;
    }
    if (notes.trim().length < 10) {
      setSubmitError("Give us a sentence or two about the work.");
      return;
    }

    setSubmitState("sending");
    try {
      const response = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          service,
          timeline,
          notes: notes.trim(),
          trap,
        }),
      });

      const body = (await response.json().catch(() => null)) as {
        error?: string;
        reference?: string;
      } | null;

      if (!response.ok) {
        throw new Error(body?.error ?? "The job book refused that brief.");
      }

      setReceipt(body?.reference ?? "WY-FILED");
      setSubmitState("done");
    } catch (error) {
      setSubmitState("error");
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The line dropped that brief. Try again.",
      );
    }
  }

  return (
    <div className="brief-card" id="job-form">
      <div className="brief-card__top">
        <span>Job request</span>
        <span>No. 026-001</span>
      </div>

      <div className="brief-card__body">
        <fieldset className="field">
          <legend>What are we building?</legend>
          <div className="chips">
            {services.map((item) => (
              <label key={item} className={`chip${service === item ? " is-on" : ""}`}>
                <input
                  type="radio"
                  name="service"
                  value={item}
                  checked={service === item}
                  onChange={() => setService(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>When do you need it?</legend>
          <div className="chips chips--small">
            {timelines.map((item) => (
              <label key={item} className={`chip${timeline === item ? " is-on" : ""}`}>
                <input
                  type="radio"
                  name="timeline"
                  value={item}
                  checked={timeline === item}
                  onChange={() => setTimeline(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="brief-fields">
          <label className="field">
            <span>Your name</span>
            <input
              type="text"
              name="name"
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Who is asking?"
              autoComplete="name"
            />
          </label>
          <label className="field">
            <span>Discord or email</span>
            <input
              type="text"
              name="contact"
              maxLength={120}
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="Optional, but useful"
              autoComplete="email"
            />
          </label>
        </div>

        <label className="field field--notes">
          <span>Anything we should know?</span>
          <textarea
            rows={3}
            maxLength={600}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="What it does, who uses it, where it lives."
          />
          <span className="field__hint">{notes.length}/600</span>
        </label>

        <label className="brief-honeypot" aria-hidden="true">
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(event) => setTrap(event.target.value)}
          />
        </label>

        <div className="brief-preview">
          <p className="brief-preview__label">The brief</p>
          <pre>{brief}</pre>
        </div>

        <div className="brief-card__actions">
          <button
            className="button"
            type="button"
            onClick={sendBrief}
            disabled={submitState === "sending" || submitState === "done"}
          >
            {submitState === "done" ? <CheckIcon /> : null}
            {submitState === "sending"
              ? "Filing…"
              : submitState === "done"
                ? "Filed"
                : "Send brief"}
          </button>
          <button className="text-link text-link--button" type="button" onClick={copyBrief}>
            {copyState === "copied" ? <CheckIcon /> : <CopyIcon />}
            {copyState === "copied" ? "Copied" : "Copy brief"}
          </button>
          <a className="text-link" href={site.invite} target="_blank" rel="noreferrer">
            <DiscordMark />
            Open a ticket
            <ArrowUpRight />
          </a>
        </div>

        <p
          className={`brief-card__hint${submitState === "error" ? " is-error" : ""}`}
          aria-live="polite"
        >
          {submitState === "done"
            ? `Filed as ${receipt}. The bench has it. Keep the reference.`
            : submitState === "error"
              ? submitError
              : copyState === "copied"
                ? "Copied. Paste it into #open-a-ticket in Discord."
                : copyState === "error"
                  ? "Copy failed. Select the brief above and copy it by hand."
                  : "Send it here and the bench picks it up. Or paste it into #open-a-ticket."}
        </p>
      </div>
    </div>
  );
}
