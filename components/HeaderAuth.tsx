"use client";

import { useEffect, useState } from "react";
import { DiscordMark } from "@/components/marks";

type AuthenticatedUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  isOwner: boolean;
};

type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "user"; user: AuthenticatedUser };

export default function HeaderAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/auth/me", {
      signal: controller.signal,
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) return { user: null };
        return (await response.json()) as { user: AuthenticatedUser | null };
      })
      .then((body) => {
        if (body.user) setState({ status: "user", user: body.user });
        else setState({ status: "guest" });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "guest" });
      });

    return () => controller.abort();
  }, []);

  if (state.status === "loading") {
    return <span className="header-auth header-auth--ghost" aria-hidden="true" />;
  }

  if (state.status === "guest") {
    return (
      <a className="header-auth" href="/login">
        <DiscordMark />
        Sign in
      </a>
    );
  }

  return (
    <a className="header-auth header-auth--user" href="/dashboard">
      <img
        src={state.user.avatarUrl}
        alt=""
        width={26}
        height={26}
        loading="lazy"
      />
      <span>{state.user.displayName}</span>
      {state.user.isOwner ? <em>Owner</em> : null}
    </a>
  );
}
