import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getAllSeries, formatPostDate } from "@/lib/blog";
import { series } from "@/data/series";
import { Section } from "@/components/section";
import { PageTransition } from "@/components/page-transition";
import { Panel } from "@/components/panel";
import { BootIn, BootItem } from "@/components/boot-in";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSeries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/series/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const info = series[slug];
  if (!info) return {};
  return { title: `${info.title} series`, description: info.description };
}

export default async function SeriesPage({ params }: PageProps<"/blog/series/[slug]">) {
  const { slug } = await params;
  const entry = getAllSeries().find((item) => item.slug === slug);
  if (!entry) notFound();

  return (
    <PageTransition>
<Section id="series" labelledBy="series-heading" className="pt-32 sm:pt-40">
      <BootIn className="mx-auto max-w-2xl">
        <BootItem>
          <p className="text-xs font-semibold tracking-wide text-accent uppercase">
            Series · {entry.posts.length} {entry.posts.length === 1 ? "part" : "parts"}
          </p>
          <h1
            id="series-heading"
            className="mt-2 text-display-sm font-semibold tracking-tight text-foreground"
          >
            {entry.title}
          </h1>
        </BootItem>
        <BootItem>
          <p className="mt-4 text-lg leading-relaxed text-muted">{entry.description}</p>
        </BootItem>

        <BootItem>
          <ol className="mt-12 flex list-none flex-col gap-4">
            {entry.posts.map((post, index) => (
              <Panel as="li" key={post.slug} className="group relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-accent uppercase">
                      Part {index + 1}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-foreground">
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                        {post.title}
                      </Link>
                    </h2>
                  </div>
                  <ArrowUpRight className="mt-1 size-5 shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                </div>
                <p className="mt-2 leading-relaxed text-muted">{post.excerpt}</p>
                <p className="mt-4 text-xs font-medium text-muted">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time> ·{" "}
                  {post.readingTime}
                </p>
              </Panel>
            ))}
            {entry.upcoming.map((part, index) => (
              <li
                key={part.order}
                className="rounded-3xl border border-dashed border-border p-6 sm:p-8"
              >
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                  Part {entry.posts.length + index + 1} · Coming soon
                </p>
                <p className="mt-1 text-xl font-semibold text-muted">{part.title}</p>
              </li>
            ))}
          </ol>
        </BootItem>

        <BootItem>
          <Link
            href="/blog"
            className="mt-10 inline-block text-sm font-medium text-accent underline underline-offset-4 hover:opacity-80"
          >
            Back to all posts
          </Link>
        </BootItem>
      </BootIn>
    </Section>
</PageTransition>
  );
}
