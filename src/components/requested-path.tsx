"use client";

import { usePathname } from "next/navigation";

export function RequestedPath() {
  const pathname = usePathname();

  return (
    <p className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-xs">
      <span className="shrink-0 text-accent">GET</span>
      <span className="min-w-0 truncate text-foreground" title={pathname}>
        {pathname}
      </span>
      <span className="shrink-0 text-red-500">404</span>
    </p>
  );
}
