"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

export interface Stage {
  name: string;
  // What goes in and what comes out of this stage, e.g. "SQL text → parse tree".
  flow: string;
  description: string;
  // A tiny, simplified picture of the data at this stage.
  snippet: string;
}

interface StepAnimationProps {
  // Shown above the stages, e.g. the SQL being followed.
  title: string;
  stages: Stage[];
  note?: string;
}

const STEP_MS = 3200;
const EASE = [0.16, 1, 0.3, 1] as const;

const controlClass =
  "inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground";

// A click-through animation for technical posts: a marker moves along a row of
// stages while a caption explains the one it is on. Every stage is also a button,
// so readers can jump around, and with reduced motion the marker simply jumps.
// MDX can't pass objects as props, so each animation is a small wrapper component
// that supplies its own stages (see query-journey.tsx).
export function StepAnimation({ title, stages, note }: StepAnimationProps) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = stages.length - 1;
  const stage = stages[index];

  // While playing, move on after a pause; stop once the last stage has been shown.
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (index >= last) setPlaying(false);
      else setIndex(index + 1);
    }, STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, index, last]);

  function jump(next: number) {
    setPlaying(false);
    setIndex(Math.min(Math.max(next, 0), last));
  }

  function togglePlay() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (index >= last) setIndex(0);
    setPlaying(true);
  }

  return (
    <figure data-step-animation className="mt-8 rounded-3xl border border-border bg-surface p-4 sm:p-6">
      <p className="overflow-x-auto font-mono text-sm whitespace-nowrap text-foreground">
        <span className="text-accent">▸ </span>
        {title}
      </p>

      <LayoutGroup id={id}>
        <ol className="mt-5 grid grid-cols-4 gap-2 md:grid-flow-col md:auto-cols-fr md:grid-cols-none">
          {stages.map((item, i) => {
            const active = i === index;
            return (
              <li key={item.name} className="relative">
                {active && (
                  <motion.span
                    layoutId={`${id}-marker`}
                    aria-hidden="true"
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute -top-1.5 left-1/2 z-10 size-3 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_0_4px_color-mix(in_oklch,var(--accent),transparent_75%)]"
                  />
                )}
                <button
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={active ? "step" : undefined}
                  className={clsx(
                    "flex h-full w-full flex-col items-center gap-0.5 rounded-xl border px-1 py-2.5 text-center transition-colors",
                    active && "border-accent bg-accent/10 text-accent",
                    !active && i < index && "border-accent/30 text-foreground",
                    !active && i >= index && "border-border text-muted hover:text-foreground",
                  )}
                >
                  <span className="font-mono text-[0.6875rem] opacity-70">{i + 1}</span>
                  <span className="text-xs leading-tight font-medium">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </LayoutGroup>

      <div className="mt-5 min-h-52" aria-live={playing ? "off" : "polite"}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: EASE }}
          >
            <p className="font-mono text-xs text-accent">
              Step {index + 1} of {stages.length} · {stage.flow}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{stage.description}</p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-background p-3 font-mono text-xs leading-relaxed whitespace-pre text-foreground">
              {stage.snippet}
            </pre>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button type="button" onClick={() => jump(index - 1)} disabled={index === 0} aria-label="Previous step" className={controlClass}>
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : index >= last ? "Replay" : "Play"}
          className={controlClass}
        >
          {playing ? <Pause className="size-4" /> : index >= last ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
        </button>
        <button type="button" onClick={() => jump(index + 1)} disabled={index === last} aria-label="Next step" className={controlClass}>
          <ChevronRight className="size-4" />
        </button>
        {note && <figcaption className="ml-2 text-xs text-muted">{note}</figcaption>}
      </div>
    </figure>
  );
}
