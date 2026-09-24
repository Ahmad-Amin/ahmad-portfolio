import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight, Rss } from "lucide-react";
import { getAllPosts, getAllTags, formatPostDate } from "@/lib/blog";
import { feedPath } from "@/lib/site";
import { Section } from "@/components/section";
import { Panel } from "@/components/panel";
import { SubscribeForm } from "@/components/subscribe-form";

const DEFAULT_DESCRIPTION =
  "Full-stack development and DevOps notes, written up from what I build and ship.";

// Ignores an unrecognized/typo'd ?tag= instead of dead-ending on an empty
// page — falls back to the full, unfiltered list.
function resolveActiveTag(tagParam: string | undefined, allTags: string[]): string | null {
  if (!tagParam) return null;
  return allTags.includes(tagParam) ? tagParam : null;
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/blog">): Promise<Metadata> {
  const { tag: tagParam } = await searchParams;
  const activeTag = resolveActiveTag(typeof tagParam === "string" ? tagParam : undefined, [
    ...getAllTags().map((t) => t.tag),
  ]);

  if (!activeTag) {
    return { title: "Blog", description: DEFAULT_DESCRIPTION };
  }

  return {
    title: `Posts tagged “${activeTag}”`,
    description: `Posts tagged “${activeTag}”. ${DEFAULT_DESCRIPTION}`,
  };
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const { tag: tagParam } = await searchParams;
  const allTags = getAllTags();
  const activeTag = resolveActiveTag(
    typeof tagParam === "string" ? tagParam : undefined,
    allTags.map((t) => t.tag),
  );

  const allPosts = getAllPosts();
  const posts = activeTag ? allPosts.filter((post) => post.tags.includes(activeTag)) : allPosts;

  return (
    <Section id="blog" labelledBy="blog-heading" className="pt-32 sm:pt-40">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-baseline justify-between gap-4">
          <h1
            id="blog-heading"
            className="text-display-sm font-semibold tracking-tight text-foreground"
          >
            Blog
          </h1>
          <a
            href={feedPath}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent"
          >
            <Rss className="size-4" />
            RSS
          </a>
        </div>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {activeTag ? (
            <>
              Showing posts tagged{" "}
              <span className="font-semibold text-foreground">“{activeTag}”</span>.{" "}
              <Link
                href="/blog"
                className="text-accent underline underline-offset-4 hover:opacity-80"
              >
                Clear filter
              </Link>
            </>
          ) : (
            DEFAULT_DESCRIPTION
          )}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={clsx(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              activeTag === null
                ? "bg-accent text-accent-foreground"
                : "bg-accent/10 text-accent hover:bg-accent/20",
            )}
          >
            All
          </Link>
          {allTags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className={clsx(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                tag === activeTag
                  ? "bg-accent text-accent-foreground"
                  : "bg-accent/10 text-accent hover:bg-accent/20",
              )}
            >
              {tag} <span className="tabular-nums opacity-70">{count}</span>
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <p className="mt-12 text-sm text-muted">No posts published yet.</p>
        ) : (
          <ul className="mt-12 flex list-none flex-col gap-4">
            {posts.map((post) => (
              <Panel
                as="li"
                key={post.slug}
                className="group relative transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                      {post.title}
                    </Link>
                  </h2>
                  <ArrowUpRight className="mt-1 size-5 shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                </div>
                <p className="mt-2 leading-relaxed text-muted">{post.excerpt}</p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <p className="text-xs font-medium text-muted">
                    <time dateTime={post.date}>{formatPostDate(post.date)}</time> ·{" "}
                    {post.readingTime}
                  </p>
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className={clsx(
                        "relative z-10 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                        tag === activeTag
                          ? "bg-accent text-accent-foreground"
                          : "bg-accent/10 text-accent hover:bg-accent/20",
                      )}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </Panel>
            ))}
          </ul>
        )}

        <div className="mt-12">
          <SubscribeForm />
        </div>
      </div>
    </Section>
  );
}
