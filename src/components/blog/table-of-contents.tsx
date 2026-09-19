"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { TocHeading } from "@/lib/toc";

// Just below the fixed nav; a heading counts as "current" once it crosses this line.
const READING_LINE = 160;

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");
  const ids = headings.map((heading) => heading.id).join(",");

  // Position-based rather than an IntersectionObserver band, so jumping past a
  // heading (End key, scrollbar drag, anchor link) can't leave a stale highlight.
  useEffect(() => {
    const elements = ids
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    let frame = 0;

    function update() {
      frame = 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = elements[0];

      if (atBottom) {
        current = elements[elements.length - 1];
      } else {
        for (const el of elements) {
          if (el.getBoundingClientRect().top > READING_LINE) break;
          current = el;
        }
      }
      setActiveId(current.id);
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [ids]);

  return (
    <nav aria-label="Table of contents">
      <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">On this page</h2>
      <ul className="mt-4 border-l border-border">
        {headings.map((heading) => {
          const active = heading.id === activeId;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={active ? "location" : undefined}
                className={clsx(
                  "-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors",
                  active
                    ? "border-accent font-medium text-accent"
                    : "border-transparent text-muted hover:text-foreground",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
