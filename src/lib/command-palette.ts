// Other components (the nav's search button) open the palette by dispatching this
// event on window, so they don't need to share state with it.
export const OPEN_PALETTE_EVENT = "open-command-palette";

export const GROUP_ORDER = ["Navigate", "Posts", "Series", "Actions", "Links"] as const;
export type PaletteGroup = (typeof GROUP_ORDER)[number];

export interface SearchableItem {
  label: string;
  group: PaletteGroup;
  // Extra words that should match but aren't shown (tags, series name, synonyms).
  keywords?: string;
}

// Every whitespace-separated word of the query must appear somewhere in the item,
// so "postgres index" finds a post tagged postgresql whose title mentions index.
// Matches on the label rank above matches on keywords only.
export function searchItems<T extends SearchableItem>(items: T[], query: string): T[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return items;

  const scored: { item: T; score: number; index: number }[] = [];
  items.forEach((item, index) => {
    const label = item.label.toLowerCase();
    const haystack = `${label} ${(item.keywords ?? "").toLowerCase()}`;
    if (!tokens.every((token) => haystack.includes(token))) return;

    let score = 0;
    for (const token of tokens) {
      if (label.startsWith(token)) score += 3;
      else if (label.includes(` ${token}`)) score += 2;
      else if (label.includes(token)) score += 1;
    }
    scored.push({ item, score, index });
  });

  // Stable: equal scores keep their original (group) order.
  return scored.sort((a, b) => b.score - a.score || a.index - b.index).map((entry) => entry.item);
}
