import { ChevronDown } from "lucide-react";
import type { TocHeading } from "@/lib/toc";

export function MobileTableOfContents({ headings }: { headings: TocHeading[] }) {
  return (
    <details className="group mt-8 rounded-2xl border border-border bg-surface px-5 py-3 lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
        On this page
        <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" />
      </summary>
      <nav aria-label="Table of contents" className="mt-3">
        <ul className="flex flex-col">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className="block py-1.5 text-sm text-muted transition-colors hover:text-accent"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
