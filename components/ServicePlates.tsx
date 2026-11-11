import { ArrowUpRight } from "@/components/marks";

const services = [
  {
    number: "01",
    name: "Discord bots",
    blurb: "Moderation, tickets, onboarding, economy. Built to live in the room.",
    tags: ["Moderation", "Tickets", "Economy"],
    art: (
      <svg className="plate__art" viewBox="0 0 260 180" fill="none" stroke="currentColor" aria-hidden="true">
        <circle cx="130" cy="90" r="66" strokeDasharray="2 7" opacity="0.5" className="art-rotate" />
        <path
          d="M94 64 54 40M166 64l40-24M94 118l-40 24M166 118l40 24"
          strokeDasharray="3 5"
          opacity="0.55"
          className="art-dash"
        />
        <rect x="96" y="64" width="68" height="54" rx="10" />
        <path d="M115 64V48M145 64V48M115 48h30" />
        <circle cx="116" cy="87" r="3.4" className="art-blink" />
        <circle cx="144" cy="87" r="3.4" />
        <path d="M119 102h22" />
        <circle cx="44" cy="32" r="14" />
        <path d="M44 24v16M37 29l14 6M51 29l-14 6" opacity="0.7" />
        <circle cx="216" cy="32" r="14" />
        <path d="M209 27h14v10h-14zM209 32h14" opacity="0.7" />
        <circle cx="44" cy="148" r="14" />
        <path d="M38 148h4l3-7 4 14 3-7h5" opacity="0.8" />
        <circle cx="216" cy="148" r="14" />
        <path d="M210 143l-4 5 4 5M222 143l4 5-4 5" opacity="0.7" />
        <text x="44" y="12" className="art-label" textAnchor="middle">MOD</text>
        <text x="216" y="12" className="art-label" textAnchor="middle">TIX</text>
        <text x="44" y="176" className="art-label" textAnchor="middle">XP</text>
        <text x="216" y="176" className="art-label" textAnchor="middle">API</text>
      </svg>
    ),
  },
  {
    number: "02",
    name: "Telegram bots",
    blurb: "Automation, payments, alerts. Quiet plumbing, loud results.",
    tags: ["Automation", "Payments", "Alerts"],
    art: (
      <svg className="plate__art" viewBox="0 0 260 180" fill="none" stroke="currentColor" aria-hidden="true">
        <circle cx="132" cy="92" r="64" strokeDasharray="1 8" opacity="0.55" className="art-rotate" />
        <circle cx="132" cy="92" r="40" opacity="0.25" />
        <path
          d="M22 142C68 52 178 22 238 64"
          strokeDasharray="4 6"
          opacity="0.55"
          className="art-dash"
        />
        <circle cx="56" cy="90" r="3" fill="currentColor" stroke="none" opacity="0.5" />
        <circle cx="196" cy="42" r="3" fill="currentColor" stroke="none" opacity="0.5" />
        <g transform="translate(96 62) rotate(-12)">
          <path d="M0 28 86 0 58 62 35 40 18 55 17 31Z" />
          <path d="M35 40 58 62M17 31l69-31" opacity="0.55" />
        </g>
        <text x="28" y="162" className="art-label">PING</text>
        <text x="112" y="170" className="art-label">PAY</text>
        <text x="196" y="162" className="art-label">ALERT</text>
      </svg>
    ),
  },
  {
    number: "03",
    name: "Websites",
    blurb: "Landing pages, dashboards, storefronts. Fast and accessible by default.",
    tags: ["Landing", "Dashboard", "Store"],
    art: (
      <svg className="plate__art" viewBox="0 0 260 180" fill="none" stroke="currentColor" aria-hidden="true">
        <rect x="30" y="26" width="200" height="128" rx="3" />
        <path d="M30 46h200" />
        <circle cx="42" cy="36" r="2.3" />
        <circle cx="51" cy="36" r="2.3" />
        <circle cx="60" cy="36" r="2.3" />
        <rect x="44" y="60" width="82" height="12" />
        <rect x="44" y="80" width="58" height="5" opacity="0.45" />
        <rect x="44" y="90" width="68" height="5" opacity="0.45" />
        <rect x="44" y="106" width="40" height="12" fill="currentColor" stroke="none" opacity="0.85" />
        <rect x="146" y="60" width="66" height="58" strokeDasharray="3 4" />
        <path d="M146 118h66M146 60l66 58" opacity="0.35" />
        <rect x="44" y="130" width="168" height="10" opacity="0.35" />
        <path
          d="M30 52h200"
          className="art-scan"
          stroke="var(--red)"
          strokeWidth="2"
        />
        <path d="M196 138l12 8-5 1.5 3 6-4 2-3-6-4 4z" fill="currentColor" stroke="none" className="art-cursor" />
        <text x="30" y="16" className="art-label">VIEWPORT</text>
      </svg>
    ),
  },
  {
    number: "04",
    name: "Managed hosting",
    blurb: "Deploy, monitor, patch, repeat. Or take the keys.",
    tags: ["Deploys", "Monitoring", "Uptime"],
    art: (
      <svg className="plate__art" viewBox="0 0 260 180" fill="none" stroke="currentColor" aria-hidden="true">
        <rect x="48" y="28" width="164" height="33" rx="2" />
        <rect x="48" y="69" width="164" height="33" rx="2" />
        <rect x="48" y="110" width="164" height="33" rx="2" />
        <path d="M62 44h52M62 85h36M62 126h58" opacity="0.55" />
        <circle cx="190" cy="44" r="3.2" stroke="none" fill="currentColor" className="art-blink" />
        <circle cx="190" cy="85" r="3.2" stroke="none" fill="currentColor" className="art-blink art-delay" />
        <circle cx="190" cy="126" r="3.2" stroke="none" fill="currentColor" className="art-blink art-delay-2" />
        <path d="M62 58h20M62 99h14M62 140h24" opacity="0.3" />
        <path
          d="M26 160h32l9-13 12 24 10-18 7 7h138"
          stroke="var(--red)"
          strokeWidth="1.6"
          strokeDasharray="120 200"
          className="art-heartbeat"
        />
        <text x="48" y="18" className="art-label">NODE 01 / 03</text>
        <text x="212" y="176" className="art-label" textAnchor="end">99.9</text>
      </svg>
    ),
  },
];

export default function ServicePlates() {
  return (
    <div className="plates">
      {services.map((service) => (
        <a
          className="plate"
          href="#brief"
          key={service.number}
          aria-label={`${service.name}: start a job`}
        >
          <span className="plate__top">
            <span>{service.number} / Service</span>
            <ArrowUpRight />
          </span>

          <span className="plate__diagram">{service.art}</span>
          <span className="plate__index" aria-hidden="true">{service.number}</span>

          <span className="plate__body">
            <span className="plate__name">{service.name}</span>
            <span className="plate__blurb">{service.blurb}</span>
            <span className="plate__tags">
              {service.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}
