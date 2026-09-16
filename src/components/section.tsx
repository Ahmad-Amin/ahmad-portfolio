"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotionConfig } from "motion/react";
import type { ReactNode } from "react";
import clsx from "clsx";

interface SectionProps {
  id: string;
  labelledBy: string;
  variant?: "contained" | "bleed";
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  labelledBy,
  variant = "contained",
  className,
  children,
}: SectionProps) {
  const [revealed, setRevealed] = useState(false);
  const rawPrefersReducedMotion = useReducedMotionConfig();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // The real value is only known on the client, and can differ from the
  // SSR default — deferring it to an effect avoids a hydration mismatch
  // that would otherwise permanently strand the SSR transition value.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefersReducedMotion(rawPrefersReducedMotion ?? false);
  }, [rawPrefersReducedMotion]);

  return (
    <motion.section
      id={id}
      aria-labelledby={labelledBy}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      onViewportEnter={() => setRevealed(true)}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={clsx("scroll-mt-20 py-20 sm:py-28", className)}
    >
      <div
        style={{
          clipPath: revealed ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
          transition: prefersReducedMotion
            ? "none"
            : "clip-path 0.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          className={clsx(
            "px-4 sm:px-6 lg:px-8",
            variant === "contained" && "mx-auto max-w-6xl",
          )}
        >
          {children}
        </div>
      </div>
    </motion.section>
  );
}
