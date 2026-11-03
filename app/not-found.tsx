import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Off the yard",
};

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="not-found__inner">
        <p className="kicker">404 / Off the yard</p>
        <h1>That plank is missing.</h1>
        <p>
          The page is not here. The work is. Head back to the yard and start
          from the front gate.
        </p>
        <a className="button" href="/">
          Back to the yard
        </a>
      </div>
    </section>
  );
}
