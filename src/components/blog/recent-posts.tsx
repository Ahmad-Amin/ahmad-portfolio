import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import { formatPostDate } from "@/lib/blog";
import { Panel } from "@/components/panel";

export function RecentPosts({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <Panel as="nav" aria-label="Recent posts" className="p-6">
      <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">Recent posts</h2>
      <ul className="mt-4 flex flex-col divide-y divide-border">
        {posts.map((post) => (
          <li key={post.slug} className="py-3 first:pt-0 last:pb-0">
            <Link href={`/blog/${post.slug}`} className="group block">
              <p className="text-sm font-medium text-foreground transition-colors group-hover:text-accent">
                {post.title}
              </p>
              <p className="mt-1 text-xs text-muted">
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
