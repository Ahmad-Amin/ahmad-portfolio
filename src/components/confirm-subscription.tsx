"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type Status = "idle" | "submitting" | "done" | "error";

export function ConfirmSubscription({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function confirm() {
    if (status === "submitting") return;
    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        setStatus("done");
        return;
      }

      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setMessage(body?.error ?? "Something went wrong. Please try again.");
    } catch {
      setMessage("Couldn't reach the server. Please check your connection and try again.");
    }
    setStatus("error");
  }

  if (status === "done") {
    return (
      <div role="status" className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-accent" />
        <h1 id="confirm-heading" className="mt-6 text-display-sm font-semibold tracking-tight text-foreground">
          You&apos;re subscribed
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted">
          Thanks for signing up. New posts will land in your inbox when I publish them.
        </p>
        <Link
          href="/blog"
          className="mt-8 inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Read the blog
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1
        id="confirm-heading"
        className="text-display-sm font-semibold tracking-tight text-foreground"
      >
        Confirm your subscription
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted">
        One more click to start getting new posts by email.
      </p>
      <button
        type="button"
        onClick={confirm}
        disabled={status === "submitting"}
        className="mt-8 inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? "Confirming…" : "Confirm subscription"}
      </button>
      {status === "error" && (
        <p role="alert" className="mt-4 text-sm text-red-500">
          {message}
        </p>
      )}
    </div>
  );
}
