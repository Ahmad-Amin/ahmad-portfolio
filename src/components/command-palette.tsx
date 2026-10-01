"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CornerDownLeft,
  Copy,
  Briefcase,
  Download,
  FileText,
  Mail,
  Moon,
  Rss,
  Search,
} from "lucide-react";
import { navLinks } from "@/data/nav-links";
import { profile } from "@/data/profile";
import { socials } from "@/data/socials";
import { feedPath } from "@/lib/site";
import { trackEvent } from "@/lib/analytics";
import {
  GROUP_ORDER,
  OPEN_PALETTE_EVENT,
  searchItems,
  type PaletteGroup,
} from "@/lib/command-palette";

const EASE = [0.16, 1, 0.3, 1] as const;

type Icon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

type Action =
  | { type: "route"; href: string }
  | { type: "external"; url: string }
  | { type: "mailto"; address: string }
  | { type: "theme" }
  | { type: "copy"; text: string };

interface Item {
  id: string;
  label: string;
  hint?: string;
  group: PaletteGroup;
  keywords?: string;
  icon: Icon;
  action: Action;
}

export interface PalettePost {
  slug: string;
  title: string;
  tags: string[];
  series?: string;
}

export interface PaletteSeries {
  slug: string;
  title: string;
}

export interface PaletteCaseStudy {
  slug: string;
  title: string;
  // The project it covers, so searching the project name finds the case study.
  projectTitle: string;
}

interface CommandPaletteProps {
  posts: PalettePost[];
  seriesList: PaletteSeries[];
  caseStudies: PaletteCaseStudy[];
}

function buildItems(
  posts: PalettePost[],
  seriesList: PaletteSeries[],
  caseStudies: PaletteCaseStudy[],
): Item[] {
  const seriesTitle = new Map(seriesList.map((entry) => [entry.slug, entry.title]));

  const navigate: Item[] = navLinks.map((link) => ({
    id: `nav-${link.label}`,
    label: link.label,
    hint: link.kind === "route" ? "Page" : "Section",
    group: "Navigate",
    icon: ArrowRight,
    action: {
      type: "route",
      href: link.kind === "route" ? link.href : `/#${link.id}`,
    },
  }));

  const caseStudyItems: Item[] = caseStudies.map((study) => ({
    id: `case-study-${study.slug}`,
    label: `${study.title} case study`,
    hint: "Case study",
    group: "Case studies",
    keywords: `${study.projectTitle} project work portfolio`,
    icon: Briefcase,
    action: { type: "route", href: `/case-studies/${study.slug}` },
  }));

  const postItems: Item[] = posts.map((post) => ({
    id: `post-${post.slug}`,
    label: post.title,
    group: "Posts",
    keywords: [...post.tags, post.series ? (seriesTitle.get(post.series) ?? "") : ""].join(" "),
    icon: FileText,
    action: { type: "route", href: `/blog/${post.slug}` },
  }));

  const seriesItems: Item[] = seriesList.map((entry) => ({
    id: `series-${entry.slug}`,
    label: entry.title,
    hint: "Series",
    group: "Series",
    icon: BookOpen,
    action: { type: "route", href: `/blog/series/${entry.slug}` },
  }));

  const actions: Item[] = [
    {
      id: "action-theme",
      label: "Toggle theme",
      hint: "Light / dark",
      group: "Actions",
      keywords: "dark light mode appearance",
      icon: Moon,
      action: { type: "theme" },
    },
    {
      id: "action-book",
      label: "Book a 15 minute call",
      group: "Actions",
      keywords: "schedule meeting cal hire",
      icon: Calendar,
      action: { type: "external", url: profile.bookingUrl },
    },
    {
      id: "action-email",
      label: "Send an email",
      hint: profile.email,
      group: "Actions",
      keywords: "contact mail",
      icon: Mail,
      action: { type: "mailto", address: profile.email },
    },
    {
      id: "action-copy-email",
      label: "Copy email address",
      group: "Actions",
      keywords: "contact mail clipboard",
      icon: Copy,
      action: { type: "copy", text: profile.email },
    },
    {
      id: "action-cv",
      label: "Download CV",
      group: "Actions",
      keywords: "resume pdf",
      icon: Download,
      action: { type: "external", url: "/Ahmad-Amin-front-CV.pdf" },
    },
    {
      id: "action-rss",
      label: "RSS feed",
      group: "Actions",
      keywords: "subscribe blog feed",
      icon: Rss,
      action: { type: "external", url: feedPath },
    },
  ];

  const links: Item[] = socials.map((social) => ({
    id: `social-${social.platform}`,
    label: social.platform,
    hint: "Opens in a new tab",
    group: "Links",
    keywords: "social profile",
    icon: social.icon,
    action: { type: "external", url: social.url },
  }));

  return [...navigate, ...caseStudyItems, ...postItems, ...seriesItems, ...actions, ...links];
}

export function CommandPalette({ posts, seriesList, caseStudies }: CommandPaletteProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const items = useMemo(() => buildItems(posts, seriesList, caseStudies), [posts, seriesList, caseStudies]);
  // Ranked within each group, then flattened in display order, so ArrowUp/Down
  // moves through the list exactly as it reads on screen.
  const grouped = useMemo(() => {
    const matches = searchItems(items, query);
    return GROUP_ORDER.flatMap((group) => {
      const entries = matches.filter((item) => item.group === group);
      return entries.length > 0 ? [{ group, entries }] : [];
    });
  }, [items, query]);
  const results = useMemo(() => grouped.flatMap((entry) => entry.entries), [grouped]);
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  const openPalette = useCallback(() => {
    // Don't stack on top of another modal (e.g. a project dialog).
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    setCopied(false);
    setOpen(true);
    trackEvent("command_palette_open");
  }, []);

  const closePalette = useCallback((restoreFocus = true) => {
    setOpen(false);
    // Hand focus back to wherever the user was. preventScroll so it can't fight
    // an anchor jump; skipped entirely when the action navigates away.
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (restoreFocus) requestAnimationFrame(() => target?.focus?.({ preventScroll: true }));
  }, []);

  // Cmd/Ctrl+K toggles; the nav's search button dispatches the open event.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (open) closePalette();
        else openPalette();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_PALETTE_EVENT, openPalette);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_PALETTE_EVENT, openPalette);
    };
  }, [open, openPalette, closePalette]);

  // Lock scroll while open (html too: see Modal for why body alone leaks).
  useEffect(() => {
    if (!open) return;
    const { body, documentElement } = document;
    const previousBody = body.style.overflow;
    const previousHtml = documentElement.style.overflow;
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousBody;
      documentElement.style.overflow = previousHtml;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-opt-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, listId]);

  function run(item: Item) {
    const { action } = item;
    if (action.type === "copy") {
      // Stay open so the "Copied" confirmation is visible.
      navigator.clipboard
        ?.writeText(action.text)
        .then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        })
        .catch(() => {});
      return;
    }

    closePalette(action.type === "theme");

    switch (action.type) {
      case "route":
        router.push(action.href);
        break;
      case "external":
        window.open(action.url, "_blank", "noopener,noreferrer");
        break;
      case "mailto":
        trackEvent("email_click", { source: "command_palette" });
        window.location.href = `mailto:${action.address}`;
        break;
      case "theme":
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        break;
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive(results.length === 0 ? 0 : (activeIndex + 1) % results.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive(results.length === 0 ? 0 : (activeIndex - 1 + results.length) % results.length);
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(Math.max(results.length - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        if (results[activeIndex]) run(results[activeIndex]);
        break;
      case "Escape":
        event.preventDefault();
        closePalette();
        break;
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: EASE }}
          onMouseDown={() => closePalette()}
          className="fixed inset-0 z-100 flex items-start justify-center bg-foreground/40 px-4 pt-[12vh] backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE }}
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.16)]"
          >
            <div className="flex items-center gap-3 border-b border-border px-5">
              <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={results.length > 0 ? `${listId}-opt-${activeIndex}` : undefined}
                aria-autocomplete="list"
                aria-label="Search pages, posts and actions"
                placeholder="Search pages, posts and actions..."
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={handleInputKeyDown}
                className="h-14 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted"
              />
              <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted sm:inline">
                Esc
              </kbd>
            </div>

            <ul
              id={listId}
              role="listbox"
              aria-label="Results"
              className="max-h-[min(24rem,60vh)] overflow-y-auto overscroll-contain p-2"
            >
              {results.length === 0 && (
                <li role="presentation" className="px-3 py-8 text-center text-sm text-muted">
                  No results for &ldquo;{query.trim()}&rdquo;
                </li>
              )}
              {grouped.map(({ group, entries }) => (
                <li key={group} role="presentation">
                  <p className="px-3 pt-3 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">
                    {group}
                  </p>
                  <ul role="presentation">
                    {entries.map((item) => {
                      const index = results.indexOf(item);
                      const selected = index === activeIndex;
                      const Icon = item.icon;
                      const hint = item.action.type === "copy" && copied ? "Copied!" : item.hint;
                      return (
                        <li
                          key={item.id}
                          id={`${listId}-opt-${index}`}
                          role="option"
                          aria-selected={selected}
                          onMouseMove={() => setActive(index)}
                          onClick={() => run(item)}
                          className={clsx(
                            "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
                            selected ? "bg-accent/10 text-accent" : "text-foreground",
                          )}
                        >
                          <Icon className="size-4 shrink-0" aria-hidden="true" />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {hint && (
                            <span
                              className={clsx(
                                "shrink-0 text-xs",
                                selected ? "text-accent/80" : "text-muted",
                              )}
                            >
                              {hint}
                            </span>
                          )}
                          {selected && (
                            <CornerDownLeft className="size-3.5 shrink-0" aria-hidden="true" />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="hidden items-center gap-4 border-t border-border px-5 py-2.5 text-xs text-muted sm:flex">
              <span>
                <kbd className="font-mono">↑↓</kbd> navigate
              </span>
              <span>
                <kbd className="font-mono">↵</kbd> select
              </span>
              <span className="ml-auto">
                <kbd className="font-mono">⌘K</kbd> / <kbd className="font-mono">Ctrl K</kbd> toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
