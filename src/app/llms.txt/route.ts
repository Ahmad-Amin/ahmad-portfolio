import { getAllPosts, getAllSeries } from "@/lib/blog";
import { getAllCaseStudies } from "@/lib/case-studies";
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
    `- [About](${siteUrl}/about): Who ${profile.name} is, what he builds and writes about, and where to find him.`,
    `- [Footprint](${siteUrl}/#footprint): Live GitHub contribution activity, npm packages, YouTube stats, and live project links.`,
    `- [Experience](${siteUrl}/#experience): Work history and roles.`,
    `- [Blog](${siteUrl}/blog): Full-stack development and DevOps notes, written up from what ${profile.name} builds and ships.`,
    `- [Contact](${siteUrl}/#contact): Ways to get in touch, including email and a CV download.`,
    `- [Book a call](${profile.bookingUrl}): Book a 15-minute call with ${profile.name}.`,
    "",
    "## Series",
    "",
    ...getAllSeries().map(
      (entry) =>
        `- [${entry.title}](${siteUrl}/blog/series/${entry.slug}): ${entry.description} (${entry.posts.length} ${entry.posts.length === 1 ? "part" : "parts"})`,
    ),
    "",
    "## Case studies",
    "",
    ...getAllCaseStudies().map(
      (study) => `- [${study.title}](${siteUrl}/case-studies/${study.slug}): ${study.tagline}`,
    ),
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
