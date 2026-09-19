import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Rss } from "lucide-react";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { feedPath } from "@/lib/site";
import { Section } from "@/components/section";
import { Panel } from "@/components/panel";

export const metadata: Metadata = {
  title: "Blog",
  description: "Full-stack development and DevOps notes, written up from what I build and ship.",
};

export default function BlogPage() {
  const posts = getAllPosts();

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
          Full-stack development and DevOps notes, written up from what I build and ship.
        </p>

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
                    <span
                      key={tag}
                      className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Panel>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
