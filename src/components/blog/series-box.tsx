import Link from "next/link";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type { PostMeta } from "@/lib/blog";
import { series } from "@/data/series";

interface SeriesBoxProps {
  seriesSlug: string;
  posts: PostMeta[];
  currentSlug: string;
}

// Sits near the top of a post: "Series title, Part N of M", expandable to the full list.
export function SeriesBox({ seriesSlug, posts, currentSlug }: SeriesBoxProps) {
  const info = series[seriesSlug];
  const position = posts.findIndex((post) => post.slug === currentSlug) + 1;
  if (!info || position === 0) return null;

  return (
    <details className="group mt-6 rounded-2xl border border-border bg-surface px-5 py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-xs font-semibold tracking-wide text-accent uppercase">
            Series · Part {position} of {posts.length}
          </span>
          <span className="mt-1 block text-sm font-semibold text-foreground">{info.title}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
      </summary>

      <ol className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
        {posts.map((post, index) => {
          const current = post.slug === currentSlug;
          return (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                aria-current={current ? "page" : undefined}
                className={clsx(
                  "flex gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  current
                    ? "bg-accent/10 font-semibold text-accent"
                    : "text-muted hover:text-foreground",
                )}
              >
                <span className="tabular-nums">{index + 1}.</span>
                <span>{post.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <Link
        href={`/blog/series/${seriesSlug}`}
        className="mt-3 inline-block text-xs font-medium text-accent underline underline-offset-4 hover:opacity-80"
      >
        About this series
      </Link>
    </details>
  );
}
