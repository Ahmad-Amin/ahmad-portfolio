import { getAllPosts } from "@/lib/blog";
import { profile } from "@/data/profile";
import { siteUrl } from "@/lib/site";

export function GET() {
  const posts = getAllPosts();

  const lines = [
    `# ${profile.brand}`,
    "",
    `> ${profile.name} — ${profile.role}. ${profile.tagline}`,
    "",
    "## Pages",
    "",
    `- [Home](${siteUrl}/#hero): Introduction and summary.`,
    `- [Footprint](${siteUrl}/#footprint): Live GitHub contribution activity, npm packages, YouTube stats, and live project links.`,
    `- [Experience](${siteUrl}/#experience): Work history and roles.`,
    `- [Blog](${siteUrl}/blog): Full-stack development and DevOps notes, written up from what ${profile.name} builds and ships.`,
    `- [Contact](${siteUrl}/#contact): Ways to get in touch.`,
    "",
    "## Blog posts",
    "",
    ...posts.map(
      (post) => `- [${post.title}](${siteUrl}/blog/${post.slug}): ${post.excerpt} (${post.date})`,
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
