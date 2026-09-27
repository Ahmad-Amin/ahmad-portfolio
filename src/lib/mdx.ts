import remarkGfm from "remark-gfm";
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from "rehype-pretty-code";

// Fenced blocks with no language (ASCII diagrams, raw EXPLAIN output) are left
// completely untouched by rehype-pretty-code and keep rendering as plain text,
// which is what we want for those.
const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: {
    light: "github-light",
    dark: "github-dark-dimmed",
  },
  // Let the site's own Panel background show through instead of Shiki's.
  keepBackground: false,
};

const rehypePlugins: [typeof rehypePrettyCode, RehypePrettyCodeOptions][] = [
  [rehypePrettyCode, rehypePrettyCodeOptions],
];

export const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins,
};
