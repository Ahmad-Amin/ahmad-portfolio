"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { navLinks, type NavLink } from "@/data/nav-links";
import { profile } from "@/data/profile";
import { useActiveSection } from "@/hooks/use-active-section";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandWordmark } from "@/components/brand-wordmark";

const SCROLL_THRESHOLD = 24;

function getHref(link: NavLink, isHome: boolean): string {
  if (link.kind === "route") return link.href;
  return isHome ? `#${link.id}` : `/#${link.id}`;
}

function isLinkActive(
  link: NavLink,
  isHome: boolean,
  pathname: string,
  activeAnchorId: string,
): boolean {
  if (link.kind === "route") {
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  }
  return isHome && activeAnchorId === link.id;
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const anchorIds = navLinks
    .filter((link): link is Extract<NavLink, { kind: "anchor" }> => link.kind === "anchor")
    .map((link) => link.id);
  const activeAnchorId = useActiveSection(anchorIds);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const brandHref = isHome ? "#hero" : "/#hero";
  const BrandTag = isHome ? "a" : Link;

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      <div
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-full border border-border/60 bg-surface/80 px-2 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md transition-[max-width] duration-300 ease-out",
          scrolled ? "max-w-2xl" : "max-w-3xl",
        )}
      >
        <BrandTag
          href={brandHref}
          aria-label={profile.brand}
          className="group/brand inline-flex items-center px-3 py-1.5"
        >
          <BrandWordmark />
        </BrandTag>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navLinks.map((link) => {
              const href = getHref(link, isHome);
              const active = isLinkActive(link, isHome, pathname, activeAnchorId);
              const className = clsx(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                active ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground",
              );
              const ariaCurrent = active ? "true" : undefined;

              if (link.kind === "route" || !isHome) {
                return (
                  <Link
                    key={link.label}
                    href={href}
                    aria-current={ariaCurrent}
                    className={className}
                  >
                    {link.label}
                  </Link>
                );
              }

              return (
                <a key={link.label} href={href} aria-current={ariaCurrent} className={className}>
                  {link.label}
                </a>
              );
            })}
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
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="w-full max-w-xs rounded-3xl border border-border bg-surface/95 p-2 shadow-xl backdrop-blur-md md:hidden"
        >
          <ul className="flex flex-col">
            {navLinks.map((link) => {
              const href = getHref(link, isHome);
              const active = isLinkActive(link, isHome, pathname, activeAnchorId);
              const className = clsx(
                "block rounded-2xl px-4 py-3 text-sm",
                active ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground",
              );
              const ariaCurrent = active ? "true" : undefined;

              return (
                <li key={link.label}>
                  {link.kind === "route" || !isHome ? (
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={ariaCurrent}
                      className={className}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={ariaCurrent}
                      className={className}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
