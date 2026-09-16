import { profile } from "@/data/profile";
import { SocialLinks } from "@/components/social-links";

export function Footer() {
  return (
    <footer className="border-t-2 border-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left lg:px-8">
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <SocialLinks />
      </div>
      <p className="pb-8 text-center font-mono text-xs tracking-wide text-muted uppercase">
        Built with Next.js &amp; Tailwind CSS
      </p>
    </footer>
  );
}
