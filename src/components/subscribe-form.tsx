"use client";

import { useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { Panel } from "@/components/panel";

type Status = "idle" | "submitting" | "sent" | "error";

export function SubscribeForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [sentTo, setSentTo] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const extra = String(data.get("extra") ?? "");

    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, extra }),
      });

      if (res.ok) {
        setSentTo(email);
        setStatus("sent");
        return;
      }

      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setMessage(body?.error ?? "Something went wrong. Please try again.");
    } catch {
      setMessage("Couldn't reach the server. Please check your connection and try again.");
    }
    setStatus("error");
  }

  return (
    <Panel shadow="subtle">
      {status === "sent" ? (
        <div role="status" className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <MailCheck className="size-4" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">Check your inbox</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              I sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{sentTo}</span>. Open it to finish
              subscribing. If it doesn&apos;t show up in a minute, check your spam folder.
            </p>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Get new posts by email
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Full-stack and DevOps notes, straight to your inbox when I publish. No spam, and you can
            unsubscribe any time.
          </p>

          <form onSubmit={handleSubmit} className="relative mt-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="subscribe-email">
                Email address
              </label>
              <input
                id="subscribe-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                aria-describedby={status === "error" ? "subscribe-error" : undefined}
                aria-invalid={status === "error" ? true : undefined}
                className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {status === "submitting" ? "Subscribing…" : "Subscribe"}
              </button>
            </div>

            <div aria-hidden="true" className="sr-only">
              <label>
                Leave this field empty
                <input type="text" name="extra" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {status === "error" && (
              <p id="subscribe-error" role="alert" className="mt-3 text-sm text-red-500">
                {message}
              </p>
            )}
          </form>
        </>
      )}
    </Panel>
  );
}
