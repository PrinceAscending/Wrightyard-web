export default function LoadingPage({ label = "Reading the line" }: { label?: string }) {
  return (
    <section className="loading-page" aria-busy="true" aria-live="polite">
      <div className="shell">
        <p className="kicker">{label}</p>
        <div className="loading-page__title skeleton" aria-hidden="true" />
        <div className="loading-page__grid" aria-hidden="true">
          <div className="skeleton" />
          <div className="skeleton" />
          <div className="skeleton" />
        </div>
        <p className="loading-page__note">
          The page is being set. The type will land in a moment.
        </p>
      </div>
    </section>
  );
}
