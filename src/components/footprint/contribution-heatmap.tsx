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
  days: ContributionDay[];
}

export function ContributionHeatmap({ days }: ContributionHeatmapProps) {
  if (days.length === 0) return null;

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

  return (
    <div className="mt-6 w-full overflow-x-auto">
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
    </div>
  );
}
