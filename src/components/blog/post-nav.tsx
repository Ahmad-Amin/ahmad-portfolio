import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostMeta } from "@/lib/blog";

const cardClass =
  "group block h-full rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40";

// Older on the left, newer on the right, the same direction as the series block
// above it and as turning the pages of a book.
export function PostNav({ newer, older }: { newer: PostMeta | null; older: PostMeta | null }) {
  if (!newer && !older) return null;

  // With only one neighbour the card takes the full width, instead of sitting in
  // one half of the row with an empty gap beside it.
  const both = newer && older;

  return (
    <nav aria-label="More posts" className="mt-10 border-t border-border pt-6">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">More from the blog</p>
      <div className={`mt-3 grid gap-4 ${both ? "sm:grid-cols-2" : ""}`}>
        {older && (
          <Link href={`/blog/${older.slug}`} className={cardClass}>
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              Older post
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
              {older.title}
            </p>
          </Link>
        )}
        {newer && (
          <Link href={`/blog/${newer.slug}`} className={`${cardClass} ${both ? "sm:text-right" : ""}`}>
            <p
              className={`flex items-center gap-1.5 text-xs font-medium text-muted ${both ? "sm:justify-end" : ""}`}
            >
              Newer post
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
              {newer.title}
            </p>
          </Link>
        )}
      </div>
    </nav>
  );
}
