import { socials } from "@/data/socials";
import { getGithubActivity, type ContributionDay } from "@/lib/github";

function getGithubUsername(): string | null {
  const github = socials.find((social) => social.platform === "GitHub");
  if (!github) return null;

  try {
    return new URL(github.url).pathname.replaceAll("/", "");
  } catch {
    return null;
  }
}

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

export async function GithubActivity() {
  const username = getGithubUsername();
  if (!username) return null;

  const activity = await getGithubActivity(username);
  if (!activity) return null;

  const captionItems = [
    { label: "Contributions", value: activity.totalContributions },
    { label: "Repos", value: activity.publicRepos },
    { label: "Stars", value: activity.stars },
    { label: "Followers", value: activity.followers },
  ];

  const days = activity.days;
  const firstDayOffset =
    days.length > 0 ? new Date(`${days[0].date}T00:00:00Z`).getUTCDay() : 0;
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
    <div>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {captionItems.map((item) => (
          <li key={item.label} className="font-mono text-sm">
            <span className="text-accent">{item.value.toLocaleString()}</span>{" "}
            <span className="tracking-wide text-muted uppercase">{item.label}</span>
          </li>
        ))}
      </ul>

      {days.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <div className="inline-block">
            <div
              className="relative h-4"
              style={{ width: weekCount * (CELL + GAP) }}
            >
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
      )}
    </div>
  );
}
