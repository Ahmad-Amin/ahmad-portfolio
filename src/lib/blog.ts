import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { series, type SeriesInfo } from "@/data/series";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
  series?: string;
  seriesOrder?: number;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
  readingTime: string;
  tags: string[];
  series?: string;
  seriesOrder?: number;
}

export interface Post extends PostMeta {
  content: string;
}

function getSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function readPost(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as PostFrontmatter;

  // Fail the build on a mistyped series instead of silently creating a dead one.
  if (frontmatter.series !== undefined) {
    if (!(frontmatter.series in series)) {
      throw new Error(
        `Post "${slug}" has unknown series "${frontmatter.series}". Add it to src/data/series.ts.`,
      );
    }
    if (typeof frontmatter.seriesOrder !== "number") {
      throw new Error(`Post "${slug}" is in a series but has no numeric seriesOrder.`);
    }
  }

  return {
    slug,
    title: frontmatter.title,
    date: frontmatter.date,
    excerpt: frontmatter.excerpt,
    tags: frontmatter.tags ?? [],
    series: frontmatter.series,
    seriesOrder: frontmatter.seriesOrder,
    readingTime: readingTime(content).text,
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  return getSlugs()
    .map((slug) => readPost(slug))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  return readPost(slug);
}

export interface TagCount {
  tag: string;
  count: number;
}

// Most-used tags first, alphabetical among ties — reads naturally as a filter bar.
export function getAllTags(): TagCount[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export interface SeriesWithPosts extends SeriesInfo {
  slug: string;
  posts: PostMeta[];
}

// Posts of one series in reading order (by `seriesOrder`, not by date).
export function getSeriesPosts(seriesSlug: string): PostMeta[] {
  const posts = getAllPosts()
    .filter((post) => post.series === seriesSlug)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));

  const seen = new Set<number>();
  for (const post of posts) {
    const order = post.seriesOrder ?? 0;
    if (seen.has(order)) {
      throw new Error(`Series "${seriesSlug}" has two posts with seriesOrder ${order}.`);
    }
    seen.add(order);
  }
  return posts;
}

// Only series that have at least one post, so empty entries never get a page.
export function getAllSeries(): SeriesWithPosts[] {
  return Object.entries(series)
    .map(([slug, info]) => ({ slug, ...info, posts: getSeriesPosts(slug) }))
    .filter((entry) => entry.posts.length > 0);
}
