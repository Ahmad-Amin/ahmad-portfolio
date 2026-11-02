import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight, Rss } from "lucide-react";
import { getAllPosts, getAllSeries, getAllTags, formatPostDate } from "@/lib/blog";
import { series } from "@/data/series";
import { feedPath } from "@/lib/site";
import { Section } from "@/components/section";
import { PageTransition } from "@/components/page-transition";
import { Panel } from "@/components/panel";
import { BootIn, BootItem } from "@/components/boot-in";
import { SubscribeForm } from "@/components/subscribe-form";
import { FiltersDisclosure } from "@/components/blog/filters-disclosure";

const DEFAULT_DESCRIPTION =
  "Full-stack development and DevOps notes, written up from what I build and ship.";

// Ignores an unrecognized/typo'd ?tag= or ?series= instead of dead-ending on an
// empty page: falls back to the full, unfiltered list.
function resolveActive(param: string | string[] | undefined, valid: string[]): string | null {
  if (typeof param !== "string" || !param) return null;
  return valid.includes(param) ? param : null;
}

// The two filters are independent and combine: a series chip keeps the chosen
// topic, and a topic chip keeps the chosen series.
function blogHref({ tag, series: seriesSlug }: { tag?: string | null; series?: string | null }) {
  const query = new URLSearchParams();
  if (seriesSlug) query.set("series", seriesSlug);
  if (tag) query.set("tag", tag);
  const qs = query.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/blog">): Promise<Metadata> {
  const params = await searchParams;
  const activeTag = resolveActive(params.tag, getAllTags().map((t) => t.tag));
  const activeSeries = resolveActive(params.series, getAllSeries().map((entry) => entry.slug));

  // Page-level `alternates` replaces the layout's, so the RSS link is repeated here.
  const rss = { "application/rss+xml": feedPath };

  if (!activeTag && !activeSeries) {
    return {
      title: "Blog",
      description: DEFAULT_DESCRIPTION,
      alternates: { canonical: "/blog", types: rss },
    };
  }

  if (activeSeries && !activeTag) {
    // The series page already lists these posts in reading order, so it's the
    // canonical home for this view.
    const info = series[activeSeries];
    return {
      title: `${info.title} series`,
      description: info.description,
      alternates: { canonical: `/blog/series/${activeSeries}`, types: rss },
    };
  }

  if (activeTag && !activeSeries) {
    return {
      title: `Posts tagged “${activeTag}”`,
      description: `Posts tagged “${activeTag}”. ${DEFAULT_DESCRIPTION}`,
      // Each tag view is its own page, so it canonicalizes to itself, not to /blog.
      alternates: { canonical: blogHref({ tag: activeTag }), types: rss },
    };
  }

  // Series and tag together: a narrow combination that isn't worth indexing.
  return {
    title: `${series[activeSeries!].title} posts tagged “${activeTag}”`,
    description: DEFAULT_DESCRIPTION,
    alternates: { canonical: blogHref({ series: activeSeries, tag: activeTag }), types: rss },
    robots: { index: false, follow: true },
  };
}

// How many topics show before the rest fold away behind "Show all topics".
const VISIBLE_TOPICS = 10;

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={clsx(
        "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "bg-accent/10 text-accent hover:bg-accent/20",
      )}
    >
      {children}
    </Link>
  );
}

function FilterHeading({ label, clearHref }: { label: string; clearHref?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</h2>
      {clearHref && (
        <Link href={clearHref} className="text-xs font-medium text-accent hover:underline">
          Clear
        </Link>
      )}
    </div>
  );
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const params = await searchParams;
  const allTags = getAllTags();
  const allSeries = getAllSeries();
  const activeTag = resolveActive(params.tag, allTags.map((t) => t.tag));
  const activeSeries = resolveActive(params.series, allSeries.map((entry) => entry.slug));
  const activeSeriesInfo = activeSeries ? series[activeSeries] : null;

  // A series already has its own row, so its tag (e.g. "sunday-tech-talk") isn't
  // repeated in the topics row. The tag still works if you open it by URL.
  const seriesSlugs = new Set(allSeries.map((entry) => entry.slug));
  const topicTags = allTags.filter(({ tag }) => !seriesSlugs.has(tag));

  const allPosts = getAllPosts();
  const posts = allPosts.filter(
    (post) =>
      (!activeTag || post.tags.includes(activeTag)) &&
      (!activeSeries || post.series === activeSeries),
  );
  const filtered = activeTag !== null || activeSeries !== null;

  const visibleTopics = topicTags.slice(0, VISIBLE_TOPICS);
  const hiddenTopics = topicTags.slice(VISIBLE_TOPICS);
  const hiddenHasActive = hiddenTopics.some(({ tag }) => tag === activeTag);

  const filterPanel = (
    <Panel as="div" shadow="subtle" className="p-5 sm:p-5">
      {allSeries.length > 0 && (
        <div>
          <FilterHeading
            label="Series"
            clearHref={activeSeries ? blogHref({ tag: activeTag }) : undefined}
          />
          <ul className="mt-3 flex list-none flex-col gap-1">
            {allSeries.map((entry) => {
              const active = entry.slug === activeSeries;
              return (
                <li key={entry.slug}>
                  <Link
                    href={blogHref({ series: entry.slug, tag: activeTag })}
                    aria-current={active ? "true" : undefined}
                    className={clsx(
                      "flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-accent/10 font-semibold text-accent"
                        : "text-foreground hover:bg-accent/5 hover:text-accent",
                    )}
                  >
                    <span>{entry.title}</span>
                    <span className="text-xs tabular-nums text-muted">{entry.posts.length}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className={clsx(allSeries.length > 0 && "mt-6 border-t border-border pt-5")}>
        <FilterHeading
          label="Topics"
          clearHref={activeTag ? blogHref({ series: activeSeries }) : undefined}
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleTopics.map(({ tag, count }) => (
            <FilterChip
              key={tag}
              href={blogHref({ series: activeSeries, tag })}
              active={tag === activeTag}
            >
              {tag} <span className="tabular-nums opacity-70">{count}</span>
            </FilterChip>
          ))}
        </div>
        {hiddenTopics.length > 0 && (
          <details className="group mt-2" open={hiddenHasActive}>
            <summary className="cursor-pointer list-none text-xs font-medium text-accent hover:underline [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Show all topics ({topicTags.length})</span>
              <span className="hidden group-open:inline">Show fewer</span>
            </summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hiddenTopics.map(({ tag, count }) => (
                <FilterChip
                  key={tag}
                  href={blogHref({ series: activeSeries, tag })}
                  active={tag === activeTag}
                >
                  {tag} <span className="tabular-nums opacity-70">{count}</span>
                </FilterChip>
              ))}
            </div>
          </details>
        )}
      </div>
    </Panel>
  );

  return (
    <PageTransition>
      <Section id="blog" labelledBy="blog-heading" className="pt-32 sm:pt-40">
        {/* Posts on the left, filters in a sticky sidebar on large screens. On a phone
            the three blocks simply stack: heading, collapsed filters, posts. */}
        <BootIn className="mx-auto grid max-w-272 gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,42rem)_1fr]">
          <BootItem className="min-w-0 lg:col-start-1">
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
              {filtered ? (
                <>
                  Showing{" "}
                  {activeSeriesInfo ? (
                    <>
                      the{" "}
                      <span className="font-semibold text-foreground">{activeSeriesInfo.title}</span>{" "}
                      series
                    </>
                  ) : (
                    "posts"
                  )}
                  {activeTag && (
                    <>
                      {" "}
                      tagged{" "}
                      <span className="font-semibold text-foreground">“{activeTag}”</span>
                    </>
                  )}
                  .{" "}
                  <Link
                    href="/blog"
                    className="text-accent underline underline-offset-4 hover:opacity-80"
                  >
                    Clear filters
                  </Link>
                  {activeSeries && !activeTag && (
                    <>
                      {" · "}
                      <Link
                        href={`/blog/series/${activeSeries}`}
                        className="text-accent underline underline-offset-4 hover:opacity-80"
                      >
                        Read in order
                      </Link>
                    </>
                  )}
                </>
              ) : (
                DEFAULT_DESCRIPTION
              )}
            </p>
          </BootItem>

          <BootItem className="min-w-0 lg:sticky lg:top-32 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100vh-10rem)] lg:self-start lg:overflow-y-auto">
            <FiltersDisclosure activeCount={(activeSeries ? 1 : 0) + (activeTag ? 1 : 0)}>
              {filterPanel}
            </FiltersDisclosure>
          </BootItem>

          <BootItem className="min-w-0 lg:col-start-1">
            {posts.length === 0 ? (
              <p className="text-sm text-muted">
                {filtered ? "No posts match these filters." : "No posts published yet."}
              </p>
            ) : (
              <ul className="flex list-none flex-col gap-4">
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
                      {post.series && series[post.series] && (
                        <Link
                          href={`/blog/series/${post.series}`}
                          className="relative z-10 rounded-full border border-accent/40 px-2.5 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                        >
                          {series[post.series].title} · Part {post.seriesOrder}
                        </Link>
                      )}
                      {/* The series badge already says it, so a tag matching a series is skipped. */}
                      {post.tags
                        .filter((tag) => !seriesSlugs.has(tag))
                        .map((tag) => (
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
          </BootItem>
        </BootIn>
      </Section>
    </PageTransition>
  );
}
