'use client';

import { ArrowUpRight, CalendarDays, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { profile } from '@/data/profile';
import { SocialLinks } from '@/components/social-links';
import { Section } from '@/components/section';
import { TrackedLink } from '@/components/tracked-link';

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const pop = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-heading">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="mx-auto max-w-2xl text-center"
      >
        <motion.h2
          variants={fadeUp}
          id="contact-heading"
          className="text-display-sm font-semibold tracking-tight text-foreground"
        >
          Let&apos;s Work Together
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-4 text-lg leading-relaxed text-muted">
          Have a project in mind or just want to say hello? Grab a time on my calendar, or email me. My inbox is always open.
        </motion.p>
        <motion.div variants={fadeUp}>
          <TrackedLink
            href={`mailto:${profile.email}`}
            event="email_click"
            params={{ location: 'contact' }}
            className="mt-8 block text-display font-semibold tracking-tight text-foreground wrap-anywhere transition-colors hover:text-accent"
          >
            {profile.email}
          </TrackedLink>
        </motion.div>

        <motion.div
          variants={pop}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <TrackedLink
            href={profile.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            event="book_call_click"
            params={{ location: 'contact' }}
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            <CalendarDays className="size-4" />
            Book a 15-min call
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </TrackedLink>
          <TrackedLink
            href="/Ahmad-Amin-front-CV.pdf"
            download
            event="cv_download"
            params={{ location: 'contact' }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
          >
            <Download className="size-4" />
            Download CV
          </TrackedLink>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10 border-t border-border pt-8">
          <SocialLinks variant="text" className="justify-center" />
        </motion.div>
      </motion.div>
    </Section>
  );
}
