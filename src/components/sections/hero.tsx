"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { profile } from "@/data/profile";
import { Section } from "@/components/section";
import { TrackedLink } from "@/components/tracked-link";

const EASE = [0.16, 1, 0.3, 1] as const;

// Runs once on mount, not on scroll: this is the "the page just booted up"
// moment, not the scroll-reveal every other section gets from Section itself.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

// The buttons land with a touch more energy than the text above them settles with.
const pop = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

export function Hero() {
  return (
    <Section id="hero" labelledBy="hero-heading" className="pt-32 sm:pt-40">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-3xl text-center"
      >
        <motion.h1
          variants={fadeUp}
          id="hero-heading"
          className="text-display font-semibold tracking-tight text-foreground wrap-anywhere"
        >
          {profile.brand}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-4 text-sm font-medium tracking-wide text-accent">
          {profile.name} · {profile.role}
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted"
        >
          {profile.tagline}
        </motion.p>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted"
        >
          {profile.bio[0]}
        </motion.p>

        <motion.div
          variants={pop}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <TrackedLink
            href="#footprint"
            event="hero_cta_click"
            params={{ cta: "view_footprint" }}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            View Footprint
          </TrackedLink>
          <TrackedLink
            href="#contact"
            event="hero_cta_click"
            params={{ cta: "get_in_touch" }}
            className="group inline-flex items-center gap-1 px-2 py-3 text-sm font-medium text-foreground transition-colors hover:text-accent"
          >
            Get in Touch
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </TrackedLink>
        </motion.div>
      </motion.div>
    </Section>
  );
}
