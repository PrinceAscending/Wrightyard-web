import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import Seal from "@/components/Seal";
import Specimen from "@/components/Specimen";
import BriefBuilder from "@/components/BriefBuilder";
import LiveBand from "@/components/LiveBand";
import HeroRig from "@/components/HeroRig";
import ServicePlates from "@/components/ServicePlates";
import ProcessRail from "@/components/ProcessRail";
import ScopeDial from "@/components/ScopeDial";
import YardRooms from "@/components/YardRooms";
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
        <HeroRig />
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
              <span>The quiet </span>
              <span>machinery </span>
              <span>behind loud </span>
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
                Wrightyard HQ is the studio&apos;s own Discord: 29 text channels,
                seven voice rooms, one bot. Designed and shipped in one pass.
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
                Custom work, written scope, fixed quote. No meter running in the
                background.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <ServicePlates />
          </Reveal>

          <p className="section-note">
            Every job starts with a written scope. No exceptions.
            <a className="text-link" href="#brief">
              Start a job
              <ArrowUpRight />
            </a>
          </p>
        </div>
      </section>

      <section className="section process" id="process" aria-labelledby="process-title">
        <div className="shell process__layout">
          <Reveal>
            <div className="process__intro">
              <p className="kicker">How a job runs</p>
              <h2 id="process-title">Four steps. No reveal at the end.</h2>
              <p>
                You know the build, the price, and the date before anyone starts
                typing.
              </p>
              <p className="process__stamp">Scope first</p>
            </div>
          </Reveal>

          <ProcessRail />
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
                Every build is quoted in writing before work starts. Fixed price,
                fixed date, no hourly meter.
              </p>
              <div className="rates__facts" aria-label="How the quote is set">
                <span>Written scope</span>
                <span>Fixed price</span>
                <span>No surprise invoices</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <ScopeDial />
          </Reveal>
        </div>
      </section>

      <section className="section receipts" id="receipts" aria-labelledby="receipts-title">
        <div className="shell receipts__grid">
          <Reveal>
            <div className="receipts__copy">
              <p className="kicker">Receipts</p>
              <h2 id="receipts-title">The first receipt is still blank.</h2>
              <p>
                No reviews yet. We would rather show an empty page than invent a
                quote. The first goes up exactly as it arrives.
              </p>
              <p className="receipts__note">If it stings, it stays.</p>
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
                Between jobs, the Discord stays open: build logs, code help,
                music, games. Twenty-nine channels, one door.
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
            <YardRooms />
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
                price, and a date. If it is not a fit, we say so.
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
