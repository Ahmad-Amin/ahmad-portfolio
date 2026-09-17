import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug, formatPostDate } from "@/lib/blog";
import { mdxComponents } from "@/components/mdx-components";
import { Section } from "@/components/section";

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

  return (
    <Section id="post" labelledBy="post-heading" className="pt-32 sm:pt-40">
      <article className="mx-auto max-w-2xl">
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
    </Section>
  );
}
