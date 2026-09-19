import { isValidElement, type ReactNode } from "react";

export interface TocHeading {
  id: string;
  text: string;
}

export function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

export function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement(node)) return nodeText((node.props as { children?: ReactNode }).children);
  return "";
}

// Strips inline markdown so the text matches what the h2 component sees when it
// renders the heading, which keeps the TOC ids in sync with the anchors.
function plainHeadingText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
}

export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  let fence: string | null = null;

  for (const line of markdown.split("\n")) {
    const fenceMatch = line.match(/^\s*(```|~~~)/);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1];
      else if (fence === fenceMatch[1]) fence = null;
      continue;
    }
    if (fence !== null) continue;

    const match = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (!match) continue;

    const text = plainHeadingText(match[1]);
    headings.push({ id: slugifyHeading(text), text });
  }

  return headings;
}
