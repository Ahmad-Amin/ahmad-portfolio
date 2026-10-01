import { getAllPosts, getAllSeries, getPostBySlug } from "@/lib/blog";
import { getAllCaseStudies } from "@/lib/case-studies";
import { profile } from "@/data/profile";
import { testimonials } from "@/data/testimonials";

// The chatbot never carries the site's writing in its prompt (that would grow
// with every post you publish). It finds and reads content on demand through
// the `siteContent` tool, which is backed by this index.

export type ContentKind = "post" | "case study" | "series" | "reviews";

interface ContentEntry {
  kind: ContentKind;
  title: string;
  path: string;
  summary: string;
  tags: string[];
  body: string;
}

// What one search can return, and how much of one page a read can return. These
// are what keep a tool result bounded (about 300 and 3,000 tokens) however much
// content the site has.
const SEARCH_RESULTS = 5;
const MAX_READ_CHARS = 12_000;

let cachedIndex: ContentEntry[] | null = null;

function buildIndex(): ContentEntry[] {
  const posts: ContentEntry[] = getAllPosts().map((meta) => ({
    kind: "post",
    title: meta.title,
    path: `/blog/${meta.slug}`,
    summary: meta.excerpt,
    tags: meta.tags,
    body: getPostBySlug(meta.slug)?.content ?? "",
  }));

  const caseStudies: ContentEntry[] = getAllCaseStudies().map((study) => ({
    kind: "case study",
    title: `${study.title} case study`,
    path: `/case-studies/${study.slug}`,
    summary: study.tagline,
    tags: [study.liveProject.title, ...study.liveProject.technologies],
    // The project card on the home page has its own, longer description; it is
    // part of what the site says about the project, so it is read along with it.
    body: `${study.content}\n\n## Project card summary (from the home page)\n${study.liveProject.description}`,
  }));

  const series: ContentEntry[] = getAllSeries().map((entry) => ({
    kind: "series",
    title: `${entry.title} series`,
    path: `/blog/series/${entry.slug}`,
    summary: entry.description,
    tags: [],
    body: entry.posts.map((post, index) => `${index + 1}. ${post.title} (/blog/${post.slug})`).join("\n"),
  }));

  // The Reviews section on the home page. One entry, so a single search finds
  // them all and nothing in the prompt grows when a review is added.
  const reviews: ContentEntry[] =
    testimonials.length === 0
      ? []
      : [
          {
            kind: "reviews",
            title: "Reviews from clients and colleagues",
            path: "/#testimonials",
            summary: `What ${testimonials.length} people who worked with ${profile.name} say about him`,
            tags: [
              "reviews",
              "testimonials",
              "recommendations",
              "feedback",
              "clients",
              "colleagues",
              ...testimonials.map((t) => t.company),
            ],
            body: testimonials
              .map((t) => `${t.name}, ${t.role}, ${t.company} (${t.linkedinUrl}):\n"${t.message}"`)
              .join("\n\n"),
          },
        ];

  return [...posts, ...caseStudies, ...series, ...reviews];
}

// Content only changes with a deploy, so production builds the index once per
// server instance; in dev it's rebuilt each time so edits show up.
function getIndex(): ContentEntry[] {
  if (process.env.NODE_ENV !== "production") return buildIndex();
  cachedIndex ??= buildIndex();
  return cachedIndex;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "was", "you", "your", "how", "what", "why", "who", "does", "did",
  "this", "that", "with", "about", "have", "has", "can", "any", "tell", "show", "post", "posts",
  "article", "articles", "wrote", "write", "written", "blog", "from", "into", "ahmad",
]);

function tokenize(query: string): string[] {
  const tokens = query.toLowerCase().match(/[a-z0-9+#.]+/g) ?? [];
  return [...new Set(tokens)].filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

// Any matching word counts (visitors ask in sentences, not keywords), weighted
// by where it matched: title, then tags, then summary, then the body text.
function score(entry: ContentEntry, tokens: string[]): number {
  const title = entry.title.toLowerCase();
  const tags = entry.tags.join(" ").toLowerCase();
  const summary = entry.summary.toLowerCase();
  const body = entry.body.toLowerCase();

  let total = 0;
  for (const token of tokens) {
    if (title.includes(token)) total += 4;
    if (tags.includes(token)) total += 3;
    if (summary.includes(token)) total += 2;
    if (body.includes(token)) total += 1;
  }
  return total;
}

export function searchContent(query: string): string {
  const tokens = tokenize(query);
  if (tokens.length === 0) return "No search terms given.";

  const matches = getIndex()
    .map((entry, order) => ({ entry, order, score: score(entry, tokens) }))
    .filter((match) => match.score > 0)
    // Equal scores keep index order, which is newest posts first.
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, SEARCH_RESULTS);

  if (matches.length === 0) return "No matching posts or case studies.";

  return matches
    .map(({ entry }) => `- [${entry.kind}] ${entry.title} | ${entry.path} | ${entry.summary}`)
    .join("\n");
}

// Markdown images cost tokens and tell the model nothing it can use.
function stripImages(markdown: string): string {
  return markdown.replace(/!\[[^\]]*\]\([^)]*\)\n*/g, "");
}

export function readContent(path: string): string {
  const entry = getIndex().find((candidate) => candidate.path === path);
  if (!entry) return "No page at that path. Use a path returned by a search.";

  const body = stripImages(entry.body).trim();
  const clipped =
    body.length > MAX_READ_CHARS ? `${body.slice(0, MAX_READ_CHARS)}\n[truncated]` : body;
  return `# ${entry.title}\nPath: ${entry.path}\n\n${clipped}`;
}

// Short, fixed-size description of the site's writing for the system prompt:
// counts, the top tags, the series, and the latest few posts. It stays the same
// size however many posts exist.
export function describeContent(): string {
  const posts = getAllPosts();
  if (posts.length === 0) return "No blog posts published yet.";

  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }
  const topics = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([tag, count]) => `${tag} (${count})`)
    .join(", ");

  // Written as ready-made markdown links so the model copies them as links.
  const series = getAllSeries()
    .slice(0, 6)
    .map((entry) => `[${entry.title}](/blog/series/${entry.slug})`)
    .join(", ");

  const latest = posts
    .slice(0, 3)
    .map((post) => `- [${post.title}](/blog/${post.slug}) (${post.date})`)
    .join("\n");

  return [
    `${posts.length} blog posts. Most common topics (partial list): ${topics}.`,
    series ? `Series: ${series}.` : null,
    `Latest posts:\n${latest}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// A pathname arrives from the browser, so it is only ever matched against real
// pages; the model sees our own titles, never visitor-supplied text.
export function describePage(pathname: string | undefined): string | null {
  if (!pathname) return null;
  if (pathname === "/") return "The visitor is on the home page.";
  if (pathname === "/blog") return "The visitor is on the blog index.";

  const entry = getIndex().find((candidate) => candidate.path === pathname.replace(/\/$/, ""));
  return entry
    ? `The visitor is currently viewing the ${entry.kind} "${entry.title}" (${entry.path}). If they ask about it ("this post", "this project"), read it with siteContent before answering instead of guessing from the title.`
    : null;
}

// Paths the widget may render as links. Anything else the model writes is shown as text.
export function getKnownPaths(): string[] {
  return getIndex().map((entry) => entry.path);
}
