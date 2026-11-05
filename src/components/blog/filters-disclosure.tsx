"use client";

import { useId, useState, type ReactNode } from "react";
import clsx from "clsx";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

// On large screens the filters sit open in a sidebar. On a phone they would push the
// posts far down the page, so they collapse behind a button instead. It's one copy of
// the markup either way: only its visibility changes.
export function FiltersDisclosure({
  activeCount,
  children,
}: {
  activeCount: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown className={clsx("size-4 text-muted transition-transform", open && "rotate-180")} />
      </button>

      <div id={panelId} className={clsx(open ? "mt-3 block" : "hidden", "lg:mt-0 lg:block")}>
        {children}
      </div>
    </div>
  );
}
