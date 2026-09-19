"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import type { ContributionDay } from "@/lib/github";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const EASE = [0.16, 1, 0.3, 1] as const;
// Slightly over-damped: it settles quickly without overshooting.
const GLIDE = { type: "spring", stiffness: 520, damping: 42, mass: 0.7 } as const;
const GAP = 3;
const MIN_WIDTH = 600;
const TOOLTIP_WIDTH = 160;
const TOOLTIP_HEIGHT = 52;
const TOOLTIP_OFFSET = 10;
// Cells this close to the top would push the tooltip out of the card, so it flips below.
const TOOLTIP_FLIP_THRESHOLD = 64;
// A quick pass across the grid shouldn't flash the tooltip, and leaving gets a
// short grace period so crossing a gap or briefly slipping out doesn't blink it.
const SHOW_DELAY_MS = 60;
const HIDE_DELAY_MS = 120;
const LEVEL_COLORS = [
  "var(--border)",
  "color-mix(in oklch, var(--accent) 25%, var(--surface))",
  "color-mix(in oklch, var(--accent) 50%, var(--surface))",
  "color-mix(in oklch, var(--accent) 75%, var(--surface))",
  "var(--accent)",
];

// Position is relative to the (non-scrolling) container so the tooltip
// isn't clipped by the horizontally scrollable grid.
interface HoveredDay {
  date: string;
  count: number;
  left: number;
  top: number;
  size: number;
  boxWidth: number;
}

function formatCount(count: number): string {
  if (count === 0) return "No contributions";
  return `${count.toLocaleString()} contribution${count === 1 ? "" : "s"}`;
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Stays mounted while the pointer moves between cells, so it glides to each
// new position instead of blinking out and back in.
function HeatmapTooltip({ hover }: { hover: HoveredDay }) {
  const centerX = hover.left + hover.size / 2;
  const half = TOOLTIP_WIDTH / 2;
  const clampedX = Math.min(Math.max(centerX, half), Math.max(hover.boxWidth - half, half));
  const below = hover.top < TOOLTIP_FLIP_THRESHOLD;
  const x = clampedX - half;
  const y = below
    ? hover.top + hover.size + TOOLTIP_OFFSET
    : hover.top - TOOLTIP_OFFSET - TOOLTIP_HEIGHT;
  const fade = { duration: 0.18, ease: EASE };

  return (
    <>
      <motion.span
        aria-hidden="true"
        initial={{ opacity: 0, x: hover.left, y: hover.top }}
        animate={{ opacity: 1, x: hover.left, y: hover.top }}
        exit={{ opacity: 0, transition: fade }}
        transition={{ x: GLIDE, y: GLIDE, opacity: fade }}
        className="pointer-events-none absolute top-0 left-0 z-10 outline-2 outline-foreground"
        style={{ width: hover.size, height: hover.size }}
      />
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.96, x, y: y + (below ? -4 : 4) }}
        animate={{ opacity: 1, scale: 1, x, y }}
        exit={{ opacity: 0, scale: 0.98, transition: fade }}
        transition={{ x: GLIDE, y: GLIDE, opacity: fade, scale: { duration: 0.22, ease: EASE } }}
        className="pointer-events-none absolute top-0 left-0 z-20 flex flex-col justify-center rounded-xl bg-foreground px-3 text-center shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
        style={{ width: TOOLTIP_WIDTH, height: TOOLTIP_HEIGHT, transformOrigin: "50% 100%" }}
      >
        <p className="text-xs font-semibold text-background">{formatCount(hover.count)}</p>
        <p className="mt-0.5 text-[11px] text-background/70">{formatDate(hover.date)}</p>
        <motion.span
          initial={false}
          animate={{ x: centerX - clampedX, rotate: 45 }}
          transition={{ x: GLIDE }}
          className={clsx(
            "absolute left-1/2 -ml-1 size-2 bg-foreground",
            below ? "-top-1" : "-bottom-1",
          )}
        />
      </motion.div>
    </>
  );
}

interface ContributionHeatmapProps {
  repos: number;
  stars: number;
  initialYear: number;
  initialDays: ContributionDay[];
  initialTotalContributions: number;
  minYear: number;
}

export function ContributionHeatmap({
  repos,
  stars,
  initialYear,
  initialDays,
  initialTotalContributions,
  minYear,
}: ContributionHeatmapProps) {
  const [year, setYear] = useState(initialYear);
  const [days, setDays] = useState(initialDays);
  const [totalContributions, setTotalContributions] = useState(initialTotalContributions);
  const [isLoading, setIsLoading] = useState(false);
  const [hover, setHover] = useState<HoveredDay | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // Mirrors `hover` so handlers can read the latest value between renders.
  const hoverRef = useRef<HoveredDay | null>(null);
  const pendingRef = useRef<HoveredDay | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHovering = hover !== null;

  useEffect(() => {
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // Touch has no "leave", so the tooltip stays until the next tap elsewhere.
  useEffect(() => {
    if (!isHovering) return;

    function handlePointerDown(event: PointerEvent) {
      if (gridRef.current?.contains(event.target as Node)) return;
      hoverRef.current = null;
      setHover(null);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isHovering]);

  function commit(next: HoveredDay | null) {
    hoverRef.current = next;
    setHover(next);
  }

  function cancelTimers() {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    showTimer.current = null;
    hideTimer.current = null;
  }

  function hideNow() {
    cancelTimers();
    pendingRef.current = null;
    commit(null);
  }

  function scheduleHide() {
    cancelTimers();
    pendingRef.current = null;
    hideTimer.current = setTimeout(hideNow, HIDE_DELAY_MS);
  }

  function showTooltip(event: React.PointerEvent<HTMLDivElement>) {
    const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-date]");
    const container = containerRef.current;
    // Gaps between cells and padding cells keep the current tooltip instead of flickering.
    if (!cell || !container) return;

    const cellRect = cell.getBoundingClientRect();
    const boxRect = container.getBoundingClientRect();
    const next: HoveredDay = {
      date: cell.dataset.date ?? "",
      count: Number(cell.dataset.count),
      left: cellRect.left - boxRect.left,
      top: cellRect.top - boxRect.top,
      size: cellRect.width,
      boxWidth: boxRect.width,
    };

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    // Already visible (glide to the new cell) or touch (no hover intent to wait for).
    if (hoverRef.current || event.pointerType !== "mouse") {
      if (showTimer.current) clearTimeout(showTimer.current);
      showTimer.current = null;
      commit(next);
      return;
    }

    pendingRef.current = next;
    if (!showTimer.current) {
      showTimer.current = setTimeout(() => {
        showTimer.current = null;
        if (pendingRef.current) commit(pendingRef.current);
      }, SHOW_DELAY_MS);
    }
  }

  async function handleYearChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextYear = Number(event.target.value);
    setYear(nextYear);
    hideNow();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/github-contributions?year=${nextYear}`);
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as { totalContributions: number; days: ContributionDay[] };
      setDays(data.days);
      setTotalContributions(data.totalContributions);
    } catch {
      // Keep showing the previously loaded year's data rather than blanking out.
    } finally {
      setIsLoading(false);
    }
  }

  const years = Array.from({ length: initialYear - minYear + 1 }, (_, i) => initialYear - i);

  let grid: React.ReactNode = null;
  if (days.length > 0) {
    const firstDayOffset = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
    const padded: (ContributionDay | null)[] = [
      ...Array.from({ length: firstDayOffset }, () => null),
      ...days,
    ];
    const weekCount = Math.ceil(padded.length / 7);

    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    for (let col = 0; col < weekCount; col++) {
      const day = padded.slice(col * 7, col * 7 + 7).find((d) => d !== null);
      if (!day) continue;
      const month = new Date(`${day.date}T00:00:00Z`).getUTCMonth();
      if (month !== lastMonth) {
        monthLabels.push({ col, label: MONTHS[month] });
        lastMonth = month;
      }
    }

    grid = (
      <div style={{ minWidth: MIN_WIDTH }}>
        <div className="relative h-4 w-full">
          {monthLabels.map(({ col, label }) => (
            <span
              key={`${col}-${label}`}
              className="absolute font-mono text-[10px] text-muted uppercase"
              style={{ left: `${(col / weekCount) * 100}%` }}
            >
              {label}
            </span>
          ))}
        </div>

        <div
          ref={gridRef}
          role="img"
          aria-label={`${totalContributions.toLocaleString()} contributions in ${year}`}
          onPointerOver={showTooltip}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") scheduleHide();
          }}
          className="mt-1 grid w-full grid-flow-col"
          style={{
            gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(7, auto)`,
            gap: `${GAP}px`,
          }}
        >
          {padded.map((day, i) =>
            day ? (
              <div
                key={day.date}
                data-date={day.date}
                data-count={day.count}
                className="aspect-square w-full"
                style={{ backgroundColor: LEVEL_COLORS[day.level] ?? LEVEL_COLORS[0] }}
              />
            ) : (
              <div key={`pad-${i}`} aria-hidden="true" className="aspect-square w-full" />
            ),
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <li className="text-sm">
            <span className="font-mono tabular-nums text-accent">{repos.toLocaleString()}</span>{" "}
            <span className="font-medium text-muted">Repos</span>
          </li>
          <li className="text-sm">
            <span className="font-mono tabular-nums text-accent">{stars.toLocaleString()}</span>{" "}
            <span className="font-medium text-muted">Stars</span>
          </li>
          <li className="text-sm">
            <span className="font-mono tabular-nums text-accent">
              {totalContributions.toLocaleString()}
            </span>{" "}
            <span className="font-medium text-muted">Contributions</span>
          </li>
        </ul>

        <div className="relative inline-flex items-center">
          <select
            value={year}
            onChange={handleYearChange}
            disabled={isLoading}
            aria-label="Select year"
            className="appearance-none rounded-full border border-border bg-surface py-1.5 pr-8 pl-3 text-xs text-foreground outline-none focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-muted" />
        </div>
      </div>

      <div ref={containerRef} className="relative mt-4">
        <div
          onScroll={hideNow}
          className={`w-full overflow-x-auto transition-opacity ${isLoading ? "opacity-50" : ""}`}
        >
          {grid ?? <p className="text-sm text-muted">No contribution data for {year}.</p>}
        </div>
        <AnimatePresence>{hover && <HeatmapTooltip key="tooltip" hover={hover} />}</AnimatePresence>
      </div>
    </div>
  );
}
