import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostMeta } from "@/lib/blog";

const cardClass =
  "group block h-full rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent/40";

export function PostNav({ newer, older }: { newer: PostMeta | null; older: PostMeta | null }) {
  if (!newer && !older) return null;

  return (
    <nav aria-label="More posts" className="mt-8 grid gap-4 sm:grid-cols-2">
      {newer && (
        <Link href={`/blog/${newer.slug}`} className={`${cardClass} sm:col-start-1`}>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Newer post
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
            {newer.title}
          </p>
        </Link>
      )}
      {older && (
        <Link href={`/blog/${older.slug}`} className={`${cardClass} sm:col-start-2 sm:text-right`}>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted sm:justify-end">
            Older post
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
            {older.title}
          </p>
        </Link>
      )}
    </nav>
  );
}
