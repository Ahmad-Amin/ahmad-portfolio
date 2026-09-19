import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { Section } from "@/components/section";
import { RecentPosts } from "@/components/blog/recent-posts";
import { RequestedPath } from "@/components/requested-path";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <Section id="not-found" labelledBy="not-found-heading" className="pt-32 sm:pt-40">
      <div className="mx-auto max-w-2xl text-center">
        <p
          aria-hidden="true"
          className="bg-linear-to-b from-accent to-accent/0 bg-clip-text text-[clamp(6rem,3rem+20vw,13rem)] leading-none font-semibold tracking-tighter text-transparent select-none"
        >
          404
        </p>
        <h1
          id="not-found-heading"
          className="mt-2 text-display-sm font-semibold tracking-tight text-foreground"
        >
          Page not found
        </h1>

        <RequestedPath />

        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted">
          Not even a load balancer could route this one. The page may have moved, or the link might
          be off by a character.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Back to home
          </Link>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1 px-2 py-3 text-sm font-medium text-foreground transition-colors hover:text-accent"
          >
            Read the blog
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {posts.length > 0 && (
        <div className="mx-auto mt-16 max-w-md text-left">
          <RecentPosts posts={posts} />
        </div>
      )}
    </Section>
  );
}
