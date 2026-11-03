import { site } from "@/lib/site";
import { ArrowUpRight, DiscordMark, Wordmark } from "@/components/marks";

const footerNav = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "Process", href: "/#process" },
  { label: "Rates", href: "/#rates" },
  { label: "Start a job", href: "/#brief" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <a href="/" aria-label="Wrightyard, home">
              <Wordmark />
            </a>
            <p>Software, built here. Kept running.</p>
          </div>

          <div className="site-footer__meta">
            <div>
              <p className="footer-label">Sitemap</p>
              <nav aria-label="Footer">
                {footerNav.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div>
              <p className="footer-label">Elsewhere</p>
              <a href={site.invite} target="_blank" rel="noreferrer">
                <DiscordMark />
                Discord
              </a>
              <a href={site.invite} target="_blank" rel="noreferrer">
                Open a ticket
                <ArrowUpRight />
              </a>
              <a href="/status">
                Live report
                <ArrowUpRight />
              </a>
              <a href="/dispatch">
                Dispatches
                <ArrowUpRight />
              </a>
              <a href="/dashboard">
                Member file
                <ArrowUpRight />
              </a>
            </div>
            <div>
              <p className="footer-label">The yard</p>
              <p className="footer-note">
                A software studio and an after-hours crew. Bots, sites, and the
                hosting that keeps them alive.
              </p>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {new Date().getFullYear()} Wrightyard</p>
          <a className="site-footer__status" href="/status">
            <span className="status-dot" aria-hidden="true" />
            Live report
          </a>
          <a href="#main">Back to top ↑</a>
        </div>

        <div className="site-footer__imprint" aria-hidden="true">
          <span>WRIGHTYARD</span>
          <span>THE YARD / 2026</span>
        </div>
      </div>
    </footer>
  );
}
