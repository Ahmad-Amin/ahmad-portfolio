# Portfolio

A single-page personal portfolio built with Next.js, TypeScript, and Tailwind CSS. Clean, minimal, responsive, with a light/dark theme toggle.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding your real content

Everything on the site is pulled from five data files — edit these, no need to touch the components:

| File | Controls |
|---|---|
| `src/data/profile.ts` | Name, role, tagline, bio paragraphs, email, location |
| `src/data/services.ts` | The service cards (icon, title, description) |
| `src/data/projects.ts` | Project cards (title, description, tags, live/repo links, optional image) |
| `src/data/socials.ts` | Social links shown in the nav-adjacent contact section and footer |
| `src/data/nav-links.ts` | Nav labels and the section ids they scroll to |

Projects without an `image` fall back to a generated gradient placeholder (`src/components/placeholder-art.tsx`) — add an image path (e.g. a file in `public/`) once you have real screenshots.

The accent color and the rest of the theme live in `src/app/globals.css` as CSS variables (`--accent`, `--background`, `--surface`, etc.), one value per light/dark mode — change those two blocks to re-theme the whole site.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Motion (scroll animations) · next-themes (dark mode) · lucide-react (icons)

## Deploying

Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new) — it's zero-config, Vercel auto-detects Next.js.
