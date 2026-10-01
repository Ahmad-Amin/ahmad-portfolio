import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostMeta } from "@/lib/blog";

const cardClass =
  "group block h-full rounded-2xl border border-accent/30 bg-accent/5 p-5 transition-colors hover:border-accent/60";

interface SeriesNavProps {
  seriesTitle: string;
  previous: PostMeta | null;
  next: PostMeta | null;
}

export function SeriesNav({ seriesTitle, previous, next }: SeriesNavProps) {
  if (!previous && !next) return null;

  return (
    <nav aria-label={`${seriesTitle} series`} className="mt-8">
      <p className="text-xs font-semibold tracking-wide text-accent uppercase">{seriesTitle}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {previous && (
          <Link href={`/blog/${previous.slug}`} className={`${cardClass} sm:col-start-1`}>
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              Previous in series
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
              {previous.title}
            </p>
          </Link>
        )}
        {next && (
          <Link href={`/blog/${next.slug}`} className={`${cardClass} sm:col-start-2 sm:text-right`}>
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted sm:justify-end">
              Next in series
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
              {next.title}
            </p>
          </Link>
        )}
      </div>
    </nav>
  );
}
