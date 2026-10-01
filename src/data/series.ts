// A series is defined once here, and a post joins it with two frontmatter
// fields: `series: "<slug>"` and `seriesOrder: <number>`. To start a new series,
// add an entry below; to extend one, just tag the new post.
export interface PlannedPart {
  title: string;
  // Must be higher than every published part's `seriesOrder`. Once the post is
  // written, delete the entry here and tag the post instead.
  order: number;
}

export interface SeriesInfo {
  title: string;
  description: string;
  // Parts you intend to write. They show as "Coming soon" (not linked) in the
  // series box and on the series page, after the published parts.
  planned?: PlannedPart[];
}

export const series: Record<string, SeriesInfo> = {
  "postgresql-internals": {
    title: "PostgreSQL Internals",
    description:
      "How PostgreSQL executes a query, finds your data, and why its B-tree indexes behave the way they do.",
    // Example: planned: [{ title: "How MVCC and VACUUM work", order: 4 }],
  },
};
