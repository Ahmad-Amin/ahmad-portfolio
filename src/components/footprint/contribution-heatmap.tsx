"use client";

import { useState, type ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";
import type { ContributionDay } from "@/lib/github";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const GAP = 3;
const MIN_WIDTH = 600;
const LEVEL_COLORS = [
  "var(--border)",
  "color-mix(in oklch, var(--accent) 25%, var(--surface))",
  "color-mix(in oklch, var(--accent) 50%, var(--surface))",
  "color-mix(in oklch, var(--accent) 75%, var(--surface))",
  "var(--accent)",
];

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

  async function handleYearChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextYear = Number(event.target.value);
    setYear(nextYear);
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
                title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
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

      <div
        className={`mt-4 w-full overflow-x-auto transition-opacity ${isLoading ? "opacity-50" : ""}`}
      >
        {grid ?? <p className="text-sm text-muted">No contribution data for {year}.</p>}
      </div>
    </div>
  );
}
