import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug, formatPostDate } from "@/lib/blog";
import { mdxComponents } from "@/components/mdx-components";
import { Section } from "@/components/section";
import { RecentPosts } from "@/components/blog/recent-posts";

const RECENT_POSTS_COUNT = 5;

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const recentPosts = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, RECENT_POSTS_COUNT);

  return (
    <Section id="post" labelledBy="post-heading" className="pt-32 sm:pt-40">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,42rem)_1fr] lg:items-start lg:gap-16">
        <article className="min-w-0">
          <h1
            id="post-heading"
            className="text-display-sm font-semibold tracking-tight text-foreground"
          >
            {post.title}
          </h1>
          <p className="mt-4 font-mono text-sm tabular-nums text-muted">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time> · {post.readingTime}
          </p>

          <MDXRemote source={post.content} components={mdxComponents} />
        </article>

        {recentPosts.length > 0 && (
          <aside className="lg:sticky lg:top-32">
            <RecentPosts posts={recentPosts} />
          </aside>
        )}
      </div>
    </Section>
  );
}
