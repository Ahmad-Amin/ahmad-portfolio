import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getAllPosts, getAllSeries } from "@/lib/blog";
import { getAllCaseStudies } from "@/lib/case-studies";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...getAllCaseStudies().map((study) => ({
      url: `${siteUrl}/case-studies/${study.slug}`,
      lastModified: new Date(study.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getAllSeries().map((entry) => ({
      url: `${siteUrl}/blog/series/${entry.slug}`,
      lastModified: new Date(entry.posts[entry.posts.length - 1].date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
