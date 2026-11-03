"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="not-found">
      <div className="not-found__inner">
        <p className="kicker">A line came loose</p>
        <h1>The press stalled.</h1>
        <p>
          Something failed while setting this page. The error has been logged
          without secrets. Try the run again, or head back to the yard.
        </p>
        <div className="error-actions">
          <button className="button" type="button" onClick={reset}>
            Run it again
          </button>
          <a className="text-link" href="/">
            Back to the yard
          </a>
        </div>
        {error.digest ? (
          <p className="error-digest">Reference: {error.digest}</p>
        ) : null}
      </div>
    </section>
  );
}
