// A series is defined once here, and a post joins it with two frontmatter
// fields: `series: "<slug>"` and `seriesOrder: <number>`. To start a new series,
// add an entry below; to extend one, just tag the new post.
export interface SeriesInfo {
  title: string;
  description: string;
}

export const series: Record<string, SeriesInfo> = {
  "postgresql-internals": {
    title: "PostgreSQL Internals",
    description:
      "How PostgreSQL executes a query, finds your data, and why its B-tree indexes behave the way they do.",
  },
};
