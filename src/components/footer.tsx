import { Rss } from "lucide-react";
import { profile } from "@/data/profile";
import { SocialLinks } from "@/components/social-links";
import { feedPath } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} {profile.brand}. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          <SocialLinks />
          <a
            href={feedPath}
            aria-label="RSS feed"
            className="inline-flex size-9 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:bg-accent/10 hover:text-accent"
          >
            <Rss className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
