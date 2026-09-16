export interface NavLink {
  label: string;
  id: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", id: "hero" },
  { label: "Services", id: "services" },
  { label: "Projects", id: "projects" },
  { label: "Experience", id: "experience" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
];
