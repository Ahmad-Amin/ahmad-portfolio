import type { ContributionDay } from "@/lib/github";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const CELL = 11;
const GAP = 3;
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
    <div className="mt-6 overflow-x-auto">
      <div className="inline-block">
        <div className="relative h-4" style={{ width: weekCount * (CELL + GAP) }}>
          {monthLabels.map(({ col, label }) => (
            <span
              key={`${col}-${label}`}
              className="absolute font-mono text-[10px] text-muted uppercase"
              style={{ left: col * (CELL + GAP) }}
            >
              {label}
            </span>
          ))}
        </div>

        <div
          className="mt-1 grid grid-flow-col"
          style={{
            gridTemplateColumns: `repeat(${weekCount}, ${CELL}px)`,
            gridTemplateRows: `repeat(7, ${CELL}px)`,
            gap: `${GAP}px`,
          }}
        >
          {padded.map((day, i) =>
            day ? (
              <div
                key={day.date}
                title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                style={{ backgroundColor: LEVEL_COLORS[day.level] ?? LEVEL_COLORS[0] }}
              />
            ) : (
              <div key={`pad-${i}`} aria-hidden="true" />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
