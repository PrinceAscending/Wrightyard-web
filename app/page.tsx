import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import Seal from "@/components/Seal";
import Specimen from "@/components/Specimen";
import BriefBuilder from "@/components/BriefBuilder";
import LiveBand from "@/components/LiveBand";
import {
  ArrowDown,
  ArrowUpRight,
  Asterisk,
  DiscordMark,
} from "@/components/marks";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wrightyard — Software, built here. Kept running.",
};

const capabilities = [
  { number: "01", name: "Discord bots", note: "Moderation, tickets, onboarding" },
  { number: "02", name: "Telegram bots", note: "Automation, payments, tools" },
  { number: "03", name: "Websites", note: "Landing pages, dashboards, stores" },
  { number: "04", name: "Managed hosting", note: "Deploy, monitor, fix, repeat" },
];

const services = [
  {
    number: "01",
    name: "Discord bots",
    description:
      "Moderation, tickets, onboarding, economy, integrations, custom commands. Built to live in the room, not interrupt it.",
    tags: ["Moderation", "Tickets", "Onboarding", "Integrations"],
  },
  {
    number: "02",
    name: "Telegram bots",
    description:
      "Automation, payments, notifications, community tools. Quiet when it should be, loud when it matters.",
    tags: ["Automation", "Payments", "Notifications"],
  },
  {
    number: "03",
    name: "Websites",
    description:
      "Landing pages, dashboards, storefronts, portfolios. Fast by default, accessible by default.",
    tags: ["Landing", "Dashboard", "Storefront"],
  },
  {
    number: "04",
    name: "Managed hosting",
    description:
      "We deploy it, watch it, patch it, and fix it before you notice. Or hand you the keys.",
    tags: ["Deploys", "Monitoring", "Uptime"],
  },
];

const process = [
  {
    number: "01",
    name: "Brief",
    body: "Tell us what is breaking, missing, or taking too long. A conversation, not a form.",
  },
  {
    number: "02",
    name: "Scope",
    body: "We write down what gets built, what it costs, and when it lands. You approve before we start.",
  },
  {
    number: "03",
    name: "Build",
    body: "Small, visible steps. You see the work as it happens, not a reveal at the end.",
  },
  {
    number: "04",
    name: "Keep",
    body: "Handoff with docs, or we stay on and run it. Either way, it keeps working.",
  },
];

const rateFactors = [
  ["Scope", "One bot or a system."],
  ["Integrations", "Payments, APIs, dashboards."],
  ["Hosting", "Managed or handoff."],
  ["Timeline", "Standard or expedited."],
];

const rooms = [
  { mark: "⌁", name: "The Workshop", note: "code help, build logs" },
  { mark: "✦", name: "The Front Desk", note: "services, quotes, client work" },
  { mark: "❀", name: "The Main Deck", note: "introductions, general" },
  { mark: "♡", name: "The Rec Room", note: "games, lobbies, bad takes" },
  { mark: "♫", name: "The Radio Room", note: "music, streams, clips" },
  { mark: "⊹", name: "The Break Room", note: "off topic, after hours" },
];

const stats = [
  ["29", "text channels"],
  ["7", "voice rooms"],
  ["3", "onboarding prompts"],
  ["4", "AutoMod rules"],
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Wrightyard",
  url: site.url,
  description: site.description,
  logo: `${site.url}/wrightyard-mark.png`,
  sameAs: [site.invite],
  areaServed: "Worldwide",
  serviceType: [
    "Discord bot development",
    "Telegram bot development",
    "Website development",
    "Managed hosting",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__crop hero__crop--tl" aria-hidden="true" />
        <div className="hero__crop hero__crop--br" aria-hidden="true" />

        <div className="shell hero__grid">
          <div className="hero__copy">
            <div className="hero__meta">
              <span>Wrightyard</span>
              <span>Software studio</span>
              <span>Est. 2026</span>
            </div>

            <h1 className="hero__title" id="hero-title">
              <span>The quiet</span>
              <span>machinery</span>
              <span>behind loud</span>
              <span>communities.</span>
            </h1>

            <p className="hero__lede">
              Discord bots, Telegram tools, websites, and managed hosting.
              Scoped in writing, built by hand, kept running.
            </p>

            <div className="hero__actions">
              <a className="button" href="#brief">
                Start a job
                <ArrowUpRight />
              </a>
              <a className="text-link" href={site.invite} target="_blank" rel="noreferrer">
                Walk the yard
                <ArrowUpRight />
              </a>
            </div>

            <div className="hero__foot">
              <a className="hero__scroll" href="#work">
                <ArrowDown />
                See the work
              </a>
              <p>
                No rate card.
                <br />
                No template.
                <br />
                No surprise invoices.
              </p>
            </div>
          </div>

          <div className="hero__proof">
            <div className="ticket">
              <div className="ticket__perf" aria-hidden="true" />
              <div className="ticket__head">
                <span>Wrightyard</span>
                <span>Job No. 026-001</span>
              </div>
              <p className="ticket__title">Job ticket</p>
              <dl className="ticket__rows">
                <div>
                  <dt>Client</dt>
                  <dd>The next one</dd>
                </div>
                <div>
                  <dt>Scope</dt>
                  <dd>Bot / site / hosting</dd>
                </div>
                <div>
                  <dt>Delivery</dt>
                  <dd>Quoted in writing</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <span className="status-dot" aria-hidden="true" />
                    Taking work
                  </dd>
                </div>
              </dl>
              <div className="ticket__barcode" aria-hidden="true">
                {Array.from({ length: 28 }).map((_, index) => (
                  <span key={index} />
                ))}
              </div>
              <div className="ticket__foot">
                <span>Built here.</span>
                <span>Kept running.</span>
              </div>
            </div>

            <Seal />

            <p className="hero__proof-note">
              The mark is a keel. The yard is where the work gets made.
            </p>
          </div>
        </div>
      </section>

      <nav className="capabilities" aria-label="Capabilities">
        <div className="shell capabilities__grid">
          {capabilities.map((item) => (
            <a key={item.number} className="capability" href="#services">
              <span className="capability__number">{item.number}</span>
              <span className="capability__name">{item.name}</span>
              <span className="capability__note">{item.note}</span>
            </a>
          ))}
        </div>
      </nav>

      <LiveBand />

      <section className="section work" id="work" aria-labelledby="work-title">
        <div className="shell">
          <Reveal>
            <div className="section-head section-head--split">
              <div>
                <p className="kicker">Selected work / Yard No. 001</p>
                <h2 id="work-title">A community built like a place.</h2>
              </div>
              <p className="section-head__lede">
                Wrightyard HQ is the studio&apos;s own Discord: 29 text
                channels, seven voice rooms, three onboarding prompts, and one
                bot. Designed and shipped in a single pass.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <Specimen />
          </Reveal>

          <Reveal delay={0.12}>
            <div className="work__foot">
              <dl className="stat-row">
                {stats.map(([value, label]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <a className="text-link" href={site.invite} target="_blank" rel="noreferrer">
                Walk through the yard
                <ArrowUpRight />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section services" id="services" aria-labelledby="services-title">
        <div className="shell">
          <Reveal>
            <div className="section-head section-head--split">
              <div>
                <p className="kicker">What we build</p>
                <h2 id="services-title">Four kinds of work. One standard.</h2>
              </div>
              <p className="section-head__lede">
                Tell us what you need. We scope it, quote it, build it, and keep
                it running. The work is custom, the process is not.
              </p>
            </div>
          </Reveal>

          <div className="ledger">
            {services.map((service) => (
              <article className="ledger__row" key={service.number}>
                <span className="ledger__number">{service.number}</span>
                <h3 className="ledger__name">{service.name}</h3>
                <p className="ledger__body">{service.description}</p>
                <ul className="ledger__tags" aria-label={`${service.name} capabilities`}>
                  {service.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <p className="ledger__note">
            Every job starts with a written scope. No exceptions.
            <a className="text-link" href="#brief">
              Start a job
              <ArrowUpRight />
            </a>
          </p>
        </div>
      </section>

      <section className="section process" id="process" aria-labelledby="process-title">
        <div className="shell">
          <Reveal>
            <div className="section-head section-head--split">
              <div>
                <p className="kicker">How a job runs</p>
                <h2 id="process-title">Four steps. No reveal at the end.</h2>
              </div>
              <p className="section-head__lede">
                You will know what is being built, what it costs, and when it
                lands before anyone starts typing.
              </p>
            </div>
          </Reveal>

          <ol className="process__grid">
            {process.map((step) => (
              <li className="process__step" key={step.number}>
                <span className="process__number">{step.number}</span>
                <h3>{step.name}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section rates" id="rates" aria-labelledby="rates-title">
        <div className="shell rates__grid">
          <Reveal>
            <div className="rates__statement">
              <p className="kicker">Rates</p>
              <h2 id="rates-title">
                No rate card.
                <br />
                The price is the scope.
              </h2>
              <p>
                Every build is quoted in writing before work starts. You get a
                fixed price and a delivery date, not an hourly meter running in
                the background.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rates__detail">
              <p className="rates__label">Four things move the number</p>
              <ol className="rates__list">
                {rateFactors.map(([name, note], index) => (
                  <li key={name}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{name}</strong>
                    <em>{note}</em>
                  </li>
                ))}
              </ol>
              <p className="rates__plain">
                No hidden numbers. No surprise invoices. If the scope changes,
                the quote changes before the work does.
              </p>
              <a className="button" href="#brief">
                Get a written quote
                <ArrowUpRight />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section receipts" id="receipts" aria-labelledby="receipts-title">
        <div className="shell receipts__grid">
          <Reveal>
            <div className="receipts__copy">
              <p className="kicker">Receipts</p>
              <h2 id="receipts-title">We&apos;d rather show you an empty page.</h2>
              <p>
                No reviews yet. We would rather show you nothing than invent a
                quote. The first receipts will be posted here exactly as they
                arrive, good or bad.
              </p>
              <p className="receipts__note">
                If we build it, the review goes up. If it stings, it stays up.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="receipt" aria-label="An empty review receipt">
              <div className="receipt__perf" aria-hidden="true" />
              <div className="receipt__head">
                <span>Wrightyard</span>
                <span>Customer copy</span>
              </div>
              <p className="receipt__title">Receipt</p>
              <dl className="receipt__rows">
                <div>
                  <dt>Client</dt>
                  <dd>Awaiting the first</dd>
                </div>
                <div>
                  <dt>Job</dt>
                  <dd>—</dd>
                </div>
                <div>
                  <dt>Rating</dt>
                  <dd>—</dd>
                </div>
                <div>
                  <dt>Review</dt>
                  <dd>—</dd>
                </div>
              </dl>
              <div className="receipt__rule" aria-hidden="true" />
              <p className="receipt__total">
                <span>Total</span>
                <span>To be written</span>
              </p>
              <p className="receipt__stamp">Pending</p>
              <div className="receipt__foot">
                <span>Built here.</span>
                <span>Kept running.</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="yard" id="yard" aria-labelledby="yard-title">
        <div className="shell yard__grid">
          <Reveal>
            <div className="yard__copy">
              <p className="kicker kicker--light">After hours</p>
              <h2 id="yard-title">The yard is also a room.</h2>
              <p>
                Between jobs, the Discord stays open: code help, build logs,
                music, games, streams. Twenty-nine channels, seven rooms, one
                bot. Walk in.
              </p>
              <div className="yard__actions">
                <a className="button button--paper" href={site.invite} target="_blank" rel="noreferrer">
                  <DiscordMark />
                  Join the yard
                  <ArrowUpRight />
                </a>
                <span className="yard__note">No pitch. No pressure. Just the room.</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <ul className="room-list">
              {rooms.map((room) => (
                <li key={room.name}>
                  <span className="room-list__mark" aria-hidden="true">
                    {room.mark}
                  </span>
                  <span>
                    <strong>{room.name}</strong>
                    <em>{room.note}</em>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section brief" id="brief" aria-labelledby="brief-title">
        <div className="shell brief__grid">
          <Reveal>
            <div className="brief__intro">
              <p className="kicker">Start a job</p>
              <h2 id="brief-title">Bring us the thing.</h2>
              <p>
                Tell us what you&apos;re building. We reply with a scope, a
                price, and a date. If it is not a fit, we will say so.
              </p>
              <p className="brief__aside">
                <Asterisk />
                No forms that disappear. No sales call unless you want one.
              </p>
              <a className="text-link" href={site.invite} target="_blank" rel="noreferrer">
                Or walk the yard first
                <ArrowUpRight />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <BriefBuilder />
          </Reveal>
        </div>
      </section>
    </>
  );
}
