import clsx from "clsx";
import { socials } from "@/data/socials";

interface SocialLinksProps {
  variant?: "icon" | "text";
  className?: string;
}

export function SocialLinks({ variant = "icon", className }: SocialLinksProps) {
  if (variant === "text") {
    return (
      <ul className={clsx("flex flex-wrap items-center gap-x-6 gap-y-2", className)}>
        {socials.map(({ platform, url }) => (
          <li key={platform}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm tracking-wide text-muted uppercase transition-colors hover:text-accent"
            >
              {platform}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={clsx("flex items-center gap-3", className)}>
      {socials.map(({ platform, url, icon: Icon }) => (
        <li key={platform}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={platform}
            className="inline-flex size-9 items-center justify-center border border-border text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Icon className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}
