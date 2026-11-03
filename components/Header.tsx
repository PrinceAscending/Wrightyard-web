"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { site } from "@/lib/site";
import { ArrowUpRight, Wordmark } from "@/components/marks";
import HeaderAuth from "@/components/HeaderAuth";

export default function Header() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner shell">
          <a className="brand" href="/" aria-label="Wrightyard, home">
            <Wordmark />
          </a>

          <nav className="site-nav" aria-label="Primary">
            {site.nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="site-header__actions">
            <a className="header-status" href="/status">
              <span className="status-dot" aria-hidden="true" />
              Live report
            </a>
            <HeaderAuth />
            <a className="button button--small" href="/#brief">
              Start a job
              <ArrowUpRight />
            </a>
          </div>

          <button
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* The overlay lives outside the header: its backdrop-filter would
          otherwise become the containing block for position: fixed. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={reduce ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav className="mobile-menu__nav" aria-label="Mobile">
              {site.nav.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: `${index * 24}ms` }}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mobile-menu__foot">
              <HeaderAuth />
              <a className="button" href="/#brief" onClick={() => setOpen(false)}>
                Start a job
                <ArrowUpRight />
              </a>
              <a className="text-link" href="/status" onClick={() => setOpen(false)}>
                Live report
                <ArrowUpRight />
              </a>
              <a className="text-link" href={site.invite} target="_blank" rel="noreferrer">
                Walk the yard
                <ArrowUpRight />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
