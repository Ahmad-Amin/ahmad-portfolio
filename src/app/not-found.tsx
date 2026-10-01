import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { Section } from "@/components/section";
import { PageTransition } from "@/components/page-transition";
import { BootIn, BootItem } from "@/components/boot-in";
import { RecentPosts } from "@/components/blog/recent-posts";
import { NotFoundTerminal } from "@/components/not-found-terminal";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <PageTransition>
<Section
      id="not-found"
      labelledBy="not-found-heading"
      className="pt-32 sm:pt-40"
    >
      <BootIn className="mx-auto max-w-2xl text-center">
        <BootItem>
          <NotFoundTerminal />
        </BootItem>
        <BootItem>
          <h1
            id="not-found-heading"
            className="mt-10 text-display-sm font-semibold tracking-tight text-foreground"
          >
            Page not found
          </h1>
        </BootItem>

        <BootItem>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted">
            Not even a load balancer could route this one. The page may have
            moved, or the link might be off by a character.
          </p>
        </BootItem>

        <BootItem
          variant="pop"
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
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
        </BootItem>
      </BootIn>

      {posts.length > 0 && (
        <div className="mx-auto mt-16 max-w-md text-left">
          <RecentPosts posts={posts} />
        </div>
      )}
    </Section>
</PageTransition>
  );
}
