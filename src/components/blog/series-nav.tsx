import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostMeta } from "@/lib/blog";

const cardClass =
  "group block h-full rounded-2xl border border-border bg-background/60 p-4 transition-colors hover:border-accent/50";

interface SeriesNavProps {
  seriesSlug: string;
  seriesTitle: string;
  // 1-based place of the current post in the series, and the series length.
  position: number;
  total: number;
  previous: PostMeta | null;
  next: PostMeta | null;
}

// One framed block for the series, so it reads as "where you are in this series"
// and stays visually apart from the plain newer/older navigation below it.
export function SeriesNav({
  seriesSlug,
  seriesTitle,
  position,
  total,
  previous,
  next,
}: SeriesNavProps) {
  if (!previous && !next) return null;

  const both = previous && next;

  return (
    <nav
      aria-label={`${seriesTitle} series`}
      className="mt-8 rounded-3xl border border-accent/30 bg-accent/5 p-4 sm:p-5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <Link
          href={`/blog/series/${seriesSlug}`}
          className="text-xs font-semibold tracking-wide text-accent uppercase underline-offset-4 hover:underline"
        >
          {seriesTitle}
        </Link>
        <p className="shrink-0 text-xs font-medium text-muted">
          Part {position} of {total}
        </p>
      </div>

      <div className={`mt-3 grid gap-3 ${both ? "sm:grid-cols-2" : ""}`}>
        {previous && (
          <Link href={`/blog/${previous.slug}`} className={cardClass}>
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              Previous in series
            </p>
            <p className="mt-1.5 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
              {previous.title}
            </p>
          </Link>
        )}
        {next && (
          <Link href={`/blog/${next.slug}`} className={`${cardClass} ${both ? "sm:text-right" : ""}`}>
            <p
              className={`flex items-center gap-1.5 text-xs font-medium text-muted ${both ? "sm:justify-end" : ""}`}
            >
              Next in series
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
            <p className="mt-1.5 text-sm font-semibold text-foreground transition-colors group-hover:text-accent">
              {next.title}
            </p>
          </Link>
        )}
      </div>
    </nav>
  );
}
