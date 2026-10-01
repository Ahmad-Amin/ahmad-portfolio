import { tool } from "ai";
import { z } from "zod";
import { readContent, searchContent } from "@/lib/bot-content";

// One tool for everything on the site, so its definition stays tiny and doesn't
// grow with the amount of content. Result sizes are bounded in bot-content.ts.
export const siteContent = tool({
  description:
    "Look up Ahmad's blog posts and case studies. Pass `query` to search (returns up to 5 matches with their paths), or `path` (a path from a search result) to read one page in full.",
  inputSchema: z.object({
    query: z.string().max(200).optional(),
    path: z.string().max(200).optional(),
  }),
  execute: async ({ query, path }) => {
    if (path) return readContent(path);
    if (query) return searchContent(query);
    return "Give either a query or a path.";
  },
});
