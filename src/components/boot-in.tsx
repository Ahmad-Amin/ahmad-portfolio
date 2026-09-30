"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Same "the page just booted up" stagger the hero uses, packaged so the
// server-rendered pages (blog, post, 404, ...) can opt in without becoming
// client components themselves. Runs once on mount, not on scroll.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const pop = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

const tags = { div: motion.div, ul: motion.ul, li: motion.li } as const;
type Tag = keyof typeof tags;

interface BootProps {
  as?: Tag;
  className?: string;
  children: ReactNode;
}

export function BootIn({ as = "div", className, children }: BootProps) {
  const reduce = useReducedMotion();
  const Comp = tags[as];
  return (
    <Comp
      variants={container}
      initial={reduce ? false : "hidden"}
      animate="show"
      className={className}
    >
      {children}
    </Comp>
  );
}

interface BootItemProps extends BootProps {
  variant?: "fadeUp" | "pop";
}

export function BootItem({
  as = "div",
  variant = "fadeUp",
  className,
  children,
}: BootItemProps) {
  const Comp = tags[as];
  return (
    <Comp variants={variant === "pop" ? pop : fadeUp} className={className}>
      {children}
    </Comp>
  );
}
