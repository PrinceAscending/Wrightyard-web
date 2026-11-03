"use client";

import { useState } from "react";

export default function SignOutButton({ label = "Sign out" }: { label?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Sign out failed.");
      window.location.assign("/");
    } catch {
      setError("The gate did not close. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="sign-out">
      <button
        className="text-link text-link--button"
        type="button"
        onClick={signOut}
        disabled={busy}
      >
        {busy ? "Closing the gate…" : label}
      </button>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
