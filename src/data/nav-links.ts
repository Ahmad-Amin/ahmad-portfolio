export type NavLink =
  | { label: string; kind: "anchor"; id: string }
  | { label: string; kind: "route"; href: string };

export const navLinks: NavLink[] = [
  { label: "Home", kind: "anchor", id: "hero" },
  { label: "Footprint", kind: "anchor", id: "footprint" },
  { label: "Experience", kind: "anchor", id: "experience" },
  { label: "Blog", kind: "route", href: "/blog" },
  { label: "Contact", kind: "anchor", id: "contact" },
];
