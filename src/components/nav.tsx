"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { navLinks } from "@/data/nav-links";
import { profile } from "@/data/profile";
import { useActiveSection } from "@/hooks/use-active-section";
import { ThemeToggle } from "@/components/theme-toggle";

export function Nav() {
  const [open, setOpen] = useState(false);
  const activeId = useActiveSection(navLinks.map((link) => link.id));

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      <div className="flex items-center gap-1 rounded-full border border-border/60 bg-surface/80 px-2 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md">
        <a
          href="#hero"
          className="px-3 py-1.5 text-sm font-semibold tracking-tight text-foreground"
        >
          {profile.brand}
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              aria-current={activeId === link.id ? "true" : undefined}
              className={clsx(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                activeId === link.id
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-foreground",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 pl-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-background/60 hover:text-foreground md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="w-full max-w-xs rounded-3xl border border-border bg-surface/95 p-2 shadow-xl backdrop-blur-md md:hidden"
        >
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={activeId === link.id ? "true" : undefined}
                  className={clsx(
                    "block rounded-2xl px-4 py-3 text-sm",
                    activeId === link.id
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
