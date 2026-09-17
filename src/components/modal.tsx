"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Shared across every Modal instance so that when one is opened on top of
// another (e.g. an image lightbox over a project modal), Escape closes only
// the topmost layer instead of both at once.
const openStack: symbol[] = [];

interface ModalProps {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  maxWidthClassName?: string;
  zIndexClassName?: string;
}

export function Modal({
  open,
  onClose,
  ariaLabel,
  children,
  maxWidthClassName = "max-w-lg",
  zIndexClassName = "z-100",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(Symbol("modal"));
  // Portal target is only safe to use once mounted on the client — `document`
  // doesn't exist during server rendering.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const id = idRef.current;
    openStack.push(id);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (openStack[openStack.length - 1] !== id) return;
      onClose();
    }

    // Locking body alone is leaky — some browsers/input methods (notably
    // trackpad scrolling in Chromium) still scroll the page through it.
    // Locking the html element too is the reliable cross-browser fix.
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();

    return () => {
      openStack.splice(openStack.indexOf(id), 1);
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  // Portalled to document.body: an ancestor further up the tree (Section's
  // clip-path wrapper, or the transform Framer Motion applies for its reveal
  // animation) would otherwise become the containing block for this fixed
  // overlay, anchoring it to that element's box instead of the viewport.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          onClick={onClose}
          className={`fixed inset-0 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm ${zIndexClassName}`}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: EASE }}
            onClick={(event) => event.stopPropagation()}
            className={`relative max-h-[85vh] w-full overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.16)] sm:p-8 ${maxWidthClassName}`}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground"
            >
              <X className="size-4" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
