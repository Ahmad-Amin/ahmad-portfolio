"use client";

import { Children, type ReactNode } from "react";
import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// The rows underneath (GithubRow, NpmRow, ...) are async server components, so
// they can't own a motion.li themselves — this wraps their already-rendered
// output on the client side instead, one motion.li per row, staggered as the
// list scrolls into view. Each row renders its own content as a plain <div>
// (not <li>) for exactly this reason: the <li> now lives here.
export function StaggerList({ children }: { children: ReactNode }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="mt-12 flex list-none flex-col gap-6 sm:gap-8"
    >
      {Children.map(children, (child) => (
        <motion.li variants={item}>{child}</motion.li>
      ))}
    </motion.ul>
  );
}
