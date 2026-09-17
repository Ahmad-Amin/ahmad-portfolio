import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
  readingTime: string;
  tags: string[];
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

  return {
    slug,
    title: frontmatter.title,
    date: frontmatter.date,
    excerpt: frontmatter.excerpt,
    tags: frontmatter.tags ?? [],
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

export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
