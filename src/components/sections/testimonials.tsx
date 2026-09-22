"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { Section } from "@/components/section";
import { Panel } from "@/components/panel";
import { TrackedLink } from "@/components/tracked-link";
import { LinkedinIcon } from "@/components/icons";

const EASE = [0.16, 1, 0.3, 1] as const;
const AUTOPLAY_INTERVAL_MS = 6_000;

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Dots({
  count,
  index,
  onSelect,
}: {
  count: number;
  index: number;
  onSelect: (i: number) => void;
}) {
  if (count <= 1) return null;

  return (
    <div className="flex gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Show review ${i + 1}`}
          className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-accent" : "w-1.5 bg-border"}`}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const rawPrefersReducedMotion = useReducedMotionConfig();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // The real value is only known on the client — deferring it to an effect
  // avoids a hydration mismatch, matching the pattern in Section.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefersReducedMotion(rawPrefersReducedMotion ?? false);
  }, [rawPrefersReducedMotion]);

  const goNext = () => setSlide(([i]) => [(i + 1) % testimonials.length, 1]);

  // Auto-advance on a timer, looping back to the start. Paused on
  // hover/focus so a reader isn't fighting the carousel mid-review, and
  // restarted from zero whenever the slide changes (auto or manual) so a
  // manual click always buys a full interval before the next auto-advance.
  useEffect(() => {
    if (testimonials.length <= 1 || paused || prefersReducedMotion) return;
    const id = setInterval(goNext, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [index, paused, prefersReducedMotion]);

  if (testimonials.length === 0) return null;

  const testimonial = testimonials[index];
  const goPrev = () =>
    setSlide(([i]) => [(i - 1 + testimonials.length) % testimonials.length, -1]);
  const goTo = (i: number) => setSlide(([current]) => [i, i > current ? 1 : -1]);

  return (
    <Section id="testimonials" labelledBy="testimonials-heading">
      <h2
        id="testimonials-heading"
        className="text-display-sm font-semibold tracking-tight text-foreground"
      >
        What People Say
      </h2>

      <div
        className="mx-auto mt-12 max-w-3xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        <Panel
          as={motion.div}
          layout
          transition={{ layout: { duration: 0.25, ease: EASE } }}
          className="relative flex flex-col overflow-hidden"
        >
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ x: direction >= 0 ? 32 : -32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction >= 0 ? -32 : 32, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="flex flex-col"
            >
              <Quote className="size-6 shrink-0 text-accent/40" aria-hidden="true" />
              <p className="mt-4 leading-relaxed text-muted">{testimonial.message}</p>

              <div className="mt-6 flex shrink-0 items-center gap-3 border-t border-border pt-4">
                {testimonial.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={testimonial.avatar}
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent"
                    aria-hidden="true"
                  >
                    {initials(testimonial.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
                <TrackedLink
                  href={testimonial.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  event="testimonial_linkedin_click"
                  params={{ name: testimonial.name }}
                  aria-label={`${testimonial.name} on LinkedIn`}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-accent/10 hover:text-accent"
                >
                  <LinkedinIcon className="size-4" />
                </TrackedLink>
              </div>
            </motion.div>
          </AnimatePresence>
        </Panel>

        {testimonials.length > 1 && (
          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous review"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-accent/40 hover:text-accent"
            >
              <ChevronLeft className="size-4" />
            </button>
            <Dots count={testimonials.length} index={index} onSelect={goTo} />
            <button
              type="button"
              onClick={goNext}
              aria-label="Next review"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-accent/40 hover:text-accent"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}
