"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotionConfig, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import clsx from "clsx";
import { testimonials, type Testimonial } from "@/data/testimonials";
import { Section } from "@/components/section";
import { Panel } from "@/components/panel";
import { Modal } from "@/components/modal";
import { TrackedLink } from "@/components/tracked-link";
import { LinkedinIcon } from "@/components/icons";

const EASE = [0.16, 1, 0.3, 1] as const;
const AUTOPLAY_INTERVAL_MS = 6_000;
const SWIPE_DISTANCE_PX = 60;
const SWIPE_VELOCITY = 500;

const slideVariants = {
  enter: (direction: number) => ({ x: direction >= 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction >= 0 ? -48 : 48, opacity: 0 }),
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

// True when the text is cut off by its line clamp. Re-measured whenever the
// element resizes, since a narrower screen wraps the same review into more lines.
function useIsClamped() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setClamped(element.scrollHeight > element.clientHeight + 1);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, clamped] as const;
}

function AuthorRow({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex items-center gap-3">
      {testimonial.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={testimonial.avatar}
          alt=""
          className="size-11 shrink-0 rounded-full object-cover ring-1 ring-accent/25"
        />
      ) : (
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent ring-1 ring-accent/25"
          aria-hidden="true"
        >
          {initials(testimonial.name)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{testimonial.name}</p>
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
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent"
      >
        <LinkedinIcon className="size-3.5" />
        <span className="hidden sm:inline">LinkedIn</span>
      </TrackedLink>
    </div>
  );
}

function TestimonialCard({
  testimonial,
  position,
  total,
  onReadFull,
}: {
  testimonial: Testimonial;
  position: number;
  total: number;
  onReadFull: () => void;
}) {
  const [textRef, clamped] = useIsClamped();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <Quote className="size-7 text-accent/50" aria-hidden="true" />
        <span className="font-mono text-xs tabular-nums text-muted" aria-hidden="true">
          {String(position).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Every review gets the same box: at most 6 lines, and at least 6 lines
          (9.75em = 6 x the 1.625 line height), so the card is one fixed height
          whatever the review's length. Longer ones open in full via the link. */}
      <p
        ref={textRef}
        className="mt-5 line-clamp-6 min-h-[9.75em] text-base leading-relaxed text-foreground/85 sm:text-lg"
      >
        {testimonial.message}
      </p>

      {/* Always reserved, so a card without the link is the same height. */}
      <div className="mt-2 h-6">
        {clamped && (
          <button
            type="button"
            onClick={onReadFull}
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Read full review
          </button>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-5">
        <AuthorRow testimonial={testimonial} />
      </div>
    </div>
  );
}

// The active dot stretches into a bar that fills over one autoplay interval.
// That fill is the autoplay timer itself (see Testimonials), not a decoration.
// Driven entirely through motion.span's own `animate` prop (never the
// imperative animate() function) — mixing that with AnimatePresence elsewhere
// on the page caused the whole slide to go transparent and stay that way.
function Dots({
  count,
  index,
  autoplay,
  paused,
  runToken,
  frozenPercent,
  remainingMs,
  onComplete,
  onSelect,
}: {
  count: number;
  index: number;
  autoplay: boolean;
  paused: boolean;
  runToken: number;
  frozenPercent: number;
  remainingMs: number;
  onComplete: () => void;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center">
      {Array.from({ length: count }, (_, i) => {
        const active = i === index;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Show review ${i + 1}`}
            aria-current={active}
            className="group flex h-6 items-center px-1"
          >
            <span
              className={clsx(
                "relative block h-1.5 overflow-hidden rounded-full bg-border transition-[width,background-color] duration-300",
                active ? "w-10" : "w-1.5 group-hover:bg-muted",
              )}
            >
              {active && !autoplay && (
                <span className="absolute inset-y-0 left-0 w-full rounded-full bg-accent" />
              )}
              {active && autoplay && paused && (
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-accent"
                  style={{ width: `${frozenPercent}%` }}
                />
              )}
              {active && autoplay && !paused && (
                <motion.span
                  key={runToken}
                  className="absolute inset-y-0 left-0 rounded-full bg-accent"
                  initial={{ width: `${frozenPercent}%` }}
                  animate={{ width: "100%" }}
                  transition={{ duration: remainingMs / 1000, ease: "linear" }}
                  onAnimationComplete={onComplete}
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Testimonials() {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const rawPrefersReducedMotion = useReducedMotionConfig();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Autoplay-timer bookkeeping. frozenPercent/remainingMs describe where the
  // bar should start its next run from; runToken forces a fresh motion.span
  // (see Dots) so a resumed run's transition restarts cleanly. cycleStartRef
  // is a plain timestamp, not render state, so it lives in a ref.
  const [frozenPercent, setFrozenPercent] = useState(0);
  const [remainingMs, setRemainingMs] = useState(AUTOPLAY_INTERVAL_MS);
  const [runToken, setRunToken] = useState(0);
  const cycleStartRef = useRef(0);
  const remainingRef = useRef(AUTOPLAY_INTERVAL_MS);
  const frozenRef = useRef(0);
  const wasPausedRef = useRef(false);

  function setRemaining(value: number) {
    remainingRef.current = value;
    setRemainingMs(value);
  }

  function setFrozen(value: number) {
    frozenRef.current = value;
    setFrozenPercent(value);
  }

  // The real value is only known on the client, deferring it to an effect
  // avoids a hydration mismatch, matching the pattern in Section.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefersReducedMotion(rawPrefersReducedMotion ?? false);
  }, [rawPrefersReducedMotion]);

  const total = testimonials.length;
  const autoplay = total > 1 && !prefersReducedMotion;
  const paused = hovered || focused || dragging || modalOpen;

  // A new slide (auto-advanced or manual) always gets a full, fresh interval.
  useEffect(() => {
    if (!autoplay) return;
    // Resetting the autoplay timer because the slide actually changed, not deriving state from props.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFrozen(0);
    setRemaining(AUTOPLAY_INTERVAL_MS);
    cycleStartRef.current = Date.now();
    setRunToken((t) => t + 1);
  }, [index, autoplay]);

  // Pausing freezes the bar exactly where it is; resuming continues from
  // there rather than restarting the full interval.
  useEffect(() => {
    if (!autoplay) return;
    const justPaused = paused && !wasPausedRef.current;
    const justResumed = !paused && wasPausedRef.current;
    wasPausedRef.current = paused;

    if (justPaused) {
      const elapsed = Date.now() - cycleStartRef.current;
      const fraction = Math.min(1, Math.max(0, elapsed / remainingRef.current));
      setFrozen(frozenRef.current + fraction * (100 - frozenRef.current));
      setRemaining(Math.max(50, remainingRef.current - elapsed));
    } else if (justResumed) {
      cycleStartRef.current = Date.now();
      setRunToken((t) => t + 1);
    }
  }, [paused, autoplay]);

  if (total === 0) return null;

  const testimonial = testimonials[index];
  const goNext = () => setSlide(([i]) => [(i + 1) % total, 1]);
  const goPrev = () => setSlide(([i]) => [(i - 1 + total) % total, -1]);
  const goTo = (i: number) => setSlide(([current]) => [i, i > current ? 1 : -1]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    setDragging(false);
    if (info.offset.x <= -SWIPE_DISTANCE_PX || info.velocity.x <= -SWIPE_VELOCITY) goNext();
    else if (info.offset.x >= SWIPE_DISTANCE_PX || info.velocity.x >= SWIPE_VELOCITY) goPrev();
  }

  // Feeds the cursor spotlight; touch has no hover, so mouse only.
  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  return (
    <Section id="testimonials" labelledBy="testimonials-heading">
      <h2
        id="testimonials-heading"
        className="text-display-sm font-semibold tracking-tight text-foreground"
      >
        What People Say
      </h2>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Client reviews"
        className="mx-auto mt-12 max-w-3xl"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        // Pause for keyboard focus only. A mouse click on an arrow also focuses
        // it, and that shouldn't leave autoplay stuck off after the pointer leaves.
        onFocus={(event) => {
          if (event.target.matches(":focus-visible")) setFocused(true);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setFocused(false);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            goPrev();
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            goNext();
          }
        }}
      >
        {/* Only wraps the front card, so the cards behind it line up with its
            bottom edge instead of stretching down behind the controls. */}
        <div className="relative">
          {/* Cards waiting behind the front one: depth, and a hint there's more. */}
          {total > 1 && (
            <>
              <div
                aria-hidden="true"
                className="absolute inset-x-6 top-3 -bottom-3 rounded-3xl bg-surface/60"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-12 top-6 -bottom-6 rounded-3xl bg-surface/30"
              />
            </>
          )}

          <Panel className="group relative overflow-hidden" onPointerMove={handlePointerMove}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-accent/10 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklch, var(--accent) 12%, transparent), transparent 70%)",
              }}
            />

            <AnimatePresence mode="popLayout" custom={direction} initial={false}>
              <motion.div
                key={index}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: EASE }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragStart={() => setDragging(true)}
                onDragEnd={handleDragEnd}
                aria-live={autoplay ? "off" : "polite"}
                className="relative cursor-grab select-none active:cursor-grabbing"
              >
                <TestimonialCard
                  testimonial={testimonial}
                  position={index + 1}
                  total={total}
                  onReadFull={() => setModalOpen(true)}
                />
              </motion.div>
            </AnimatePresence>
          </Panel>
        </div>

        {total > 1 && (
          <div className="mt-14 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous review"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-[color,border-color,transform] hover:border-accent/40 hover:text-accent active:scale-95"
            >
              <ChevronLeft className="size-4" />
            </button>
            <Dots
              count={total}
              index={index}
              autoplay={autoplay}
              paused={paused}
              runToken={runToken}
              frozenPercent={frozenPercent}
              remainingMs={remainingMs}
              onComplete={goNext}
              onSelect={goTo}
            />
            <button
              type="button"
              onClick={goNext}
              aria-label="Next review"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-[color,border-color,transform] hover:border-accent/40 hover:text-accent active:scale-95"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ariaLabel={`Review from ${testimonial.name}`}
        maxWidthClassName="max-w-2xl"
      >
        <Quote className="size-7 text-accent/50" aria-hidden="true" />
        <p className="mt-4 text-lg leading-relaxed text-foreground/90">{testimonial.message}</p>
        <div className="mt-6 border-t border-border pt-5">
          <AuthorRow testimonial={testimonial} />
        </div>
      </Modal>
    </Section>
  );
}
