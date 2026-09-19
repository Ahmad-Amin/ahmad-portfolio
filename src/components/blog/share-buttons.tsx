"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { LinkedinIcon, XIcon } from "@/components/icons";

const COPIED_RESET_MS = 2000;

const iconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:bg-accent/10 hover:text-accent";

// `url` is the post's canonical URL, so shares never carry localhost or a preview-deployment address.
export function ShareButtons({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      return;
    }
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
  }

  function openShare(target: string) {
    window.open(target, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm font-medium text-muted">Share this post</p>

      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface px-3.5 text-sm font-medium text-muted transition-colors hover:bg-accent/10 hover:text-accent"
      >
        {copied ? <Check className="size-4 text-accent" /> : <Link2 className="size-4" />}
        {copied ? "Link copied" : "Copy link"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>

      <button
        type="button"
        aria-label="Share on LinkedIn"
        onClick={() =>
          openShare(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          )
        }
        className={iconButtonClass}
      >
        <LinkedinIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Share on X"
        onClick={() =>
          openShare(
            `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          )
        }
        className={iconButtonClass}
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}
