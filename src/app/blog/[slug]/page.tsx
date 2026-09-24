import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug, formatPostDate } from "@/lib/blog";
import { mdxComponents } from "@/components/mdx-components";
import { Section } from "@/components/section";
import { RecentPosts } from "@/components/blog/recent-posts";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { MobileTableOfContents } from "@/components/blog/mobile-table-of-contents";
import { ShareButtons } from "@/components/blog/share-buttons";
import { PostNav } from "@/components/blog/post-nav";
import { SubscribeForm } from "@/components/subscribe-form";
import { extractHeadings } from "@/lib/toc";
import { feedPath, siteUrl } from "@/lib/site";
import { profile } from "@/data/profile";
import { socials } from "@/data/socials";

const RECENT_POSTS_COUNT = 5;
// Short posts don't need a table of contents.
const MIN_TOC_HEADINGS = 3;

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

  const url = `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url, types: { "application/rss+xml": feedPath } },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      url,
      siteName: "TechWithSwag",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const index = allPosts.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? allPosts[index - 1] : null;
  const older = index < allPosts.length - 1 ? allPosts[index + 1] : null;
  const recentPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, RECENT_POSTS_COUNT);

  const headings = extractHeadings(post.content);
  const showToc = headings.length >= MIN_TOC_HEADINGS;

  const postUrl = `${siteUrl}/blog/${post.slug}`;
  // Helps search engines show author/date info and surfaces the post to
  // AI answer engines with a real citation (complements llms.txt).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    url: postUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    image: `${postUrl}/opengraph-image`,
    inLanguage: "en",
    keywords: post.tags.join(", "),
    author: {
      "@type": "Person",
      name: profile.name,
      url: siteUrl,
      sameAs: socials.map((social) => social.url),
    },
    publisher: {
      "@type": "Organization",
      name: profile.brand,
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Section id="post" labelledBy="post-heading" className="pt-32 sm:pt-40">
        <div className="mx-auto grid max-w-272 grid-cols-1 gap-12 lg:grid-cols-[minmax(0,42rem)_1fr] lg:items-start lg:gap-16">
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

            {showToc && <MobileTableOfContents headings={headings} />}

            <MDXRemote source={post.content} components={mdxComponents} />

            <div className="mt-16 border-t border-border pt-8">
              <div className="mb-10">
                <SubscribeForm />
              </div>
              <ShareButtons title={post.title} url={`${siteUrl}/blog/${post.slug}`} />
              <PostNav newer={newer} older={older} />
            </div>
          </article>

          {(showToc || recentPosts.length > 0) && (
            <aside className="lg:sticky lg:top-32 lg:-mx-1 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:overscroll-contain lg:px-1">
              {showToc && (
                <div className="hidden lg:block">
                  <TableOfContents headings={headings} />
                </div>
              )}
              {recentPosts.length > 0 && (
                <div className={showToc ? "lg:mt-8" : undefined}>
                  <RecentPosts posts={recentPosts} />
                </div>
              )}
            </aside>
          )}
        </div>
      </Section>
    </>
  );
}
