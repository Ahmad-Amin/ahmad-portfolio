"use client";

import { usePathname } from "next/navigation";

// A fake terminal session for the 404 page: the path the visitor asked for, run
// through `curl -I`, and the response it got. Decorative, so the real heading
// below it carries the meaning for assistive tech.
export function NotFoundTerminal() {
  const pathname = usePathname();

  return (
    <div
      aria-hidden="true"
      className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="size-3 rounded-full bg-red-500/80" />
        <span className="size-3 rounded-full bg-amber-500/80" />
        <span className="size-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 font-mono text-xs text-muted">bash</span>
      </div>

      <div className="space-y-1 p-5 font-mono text-sm leading-relaxed">
        <p className="break-all text-foreground">
          <span className="text-accent">$</span> curl -I {pathname}
        </p>
        <p>
          <span className="text-muted">HTTP/1.1</span>{" "}
          <span className="font-semibold text-red-500">404 Not Found</span>
        </p>
        <p className="text-muted">content-type: text/html</p>
        <p className="text-muted">x-hint: no route here, or the link is off by a character</p>
        <p className="flex items-center gap-2 pt-1 text-foreground">
          <span className="text-accent">$</span>
          <span className="inline-block h-4 w-2 bg-accent motion-safe:animate-pulse" />
        </p>
      </div>
    </div>
  );
}
