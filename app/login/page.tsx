import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { safeNextPath } from "@/lib/redirects";
import { site } from "@/lib/site";
import { ArrowUpRight, DiscordMark } from "@/components/marks";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Wrightyard with Discord to open your member file.",
  robots: { index: false, follow: false },
};

const errors: Record<string, string> = {
  denied: "The gate was closed on the Discord side. Nothing was shared.",
  state: "That sign-in ticket expired or did not match. Try the gate again.",
  exchange: "Discord accepted the sign-in, then the line dropped. Try once more.",
  profile: "Discord did not return a readable profile. Try once more.",
  config: "Sign-in is not configured on this deployment yet.",
  rate: "Too many attempts from this line. Wait a few minutes.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const session = await getSession();
  if (session) redirect(next ?? "/dashboard");

  const error = params.error ? errors[params.error] ?? errors.exchange : null;

  return (
    <section className="gate">
      <div className="shell gate__grid">
        <div className="gate__copy">
          <p className="kicker">Member gate / Discord OAuth</p>
          <h1>
            Your file is
            <br />
            already here.
          </h1>
          <p className="gate__lede">
            Sign in to see your member file, the live yard report, and the work
            board. One tap, no password, no second account to tend.
          </p>

          <dl className="gate__facts">
            <div>
              <dt>Identifies</dt>
              <dd>Your Discord name, avatar, and ID. Nothing else.</dd>
            </div>
            <div>
              <dt>Stores</dt>
              <dd>A signed session cookie, kept for seven days.</dd>
            </div>
            <div>
              <dt>Never</dt>
              <dd>Messages, member lists, or anything you did not offer.</dd>
            </div>
          </dl>

          <a className="text-link" href={site.invite} target="_blank" rel="noreferrer">
            Not in the yard yet? Walk in
            <ArrowUpRight />
          </a>
        </div>

        <div className="gate-card">
          <div className="gate-card__perf" aria-hidden="true" />
          <div className="gate-card__head">
            <span>Wrightyard</span>
            <span>Gate pass / 07 days</span>
          </div>

          <p className="gate-card__title">Sign in</p>
          <p className="gate-card__intro">
            We ask Discord who you are. That is the whole exchange.
          </p>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <a
            className="button gate-card__button"
            href={next ? `/api/auth/login?next=${encodeURIComponent(next)}` : "/api/auth/login"}
          >
            <DiscordMark />
            Continue with Discord
            <ArrowUpRight />
          </a>

          <ul className="gate-card__scope">
            <li>
              <span aria-hidden="true">01</span>
              Scope: <strong>identify</strong>
            </li>
            <li>
              <span aria-hidden="true">02</span>
              Session: signed, HTTP-only
            </li>
            <li>
              <span aria-hidden="true">03</span>
              Access: dashboard only
            </li>
          </ul>

          <p className="gate-card__foot">
            Built here. Kept running. The gate closes the same way it opens.
          </p>
        </div>
      </div>
    </section>
  );
}
