import { getChannelStats, getLatestVideos, TECHWITHSWAG_CHANNEL_ID } from "@/lib/youtube";
import { Panel } from "@/components/panel";

// Matches YouTube's own display convention: ~3 significant figures with a
// K/M/B suffix (3,150 -> "3.15K", 18,117 -> "18.1K"), plain below 1,000.
function formatCompactNumber(value: number): string {
  const units: { threshold: number; suffix: string }[] = [
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "K" },
  ];

  for (const { threshold, suffix } of units) {
    if (value >= threshold) {
      const scaled = value / threshold;
      const precision = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
      return `${scaled.toFixed(precision)}${suffix}`;
    }
  }

  return value.toString();
}

function formatViews(views: number): string {
  return `${formatCompactNumber(views)} views`;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export async function YoutubeRow() {
  const [videos, stats] = await Promise.all([
    getLatestVideos(TECHWITHSWAG_CHANNEL_ID),
    getChannelStats(TECHWITHSWAG_CHANNEL_ID),
  ]);

  return (
    <Panel as="li">
      <h3 className="text-xl font-semibold text-foreground">YouTube</h3>
      <p className="mt-1 text-muted">
        Videos where I break down what I&apos;m building and what I&apos;ve learned.
      </p>

      {stats && (
        <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          {[
            stats.subscribers !== null ? { label: "Subscribers", value: stats.subscribers } : null,
            { label: "Videos", value: stats.videos },
            { label: "Views", value: stats.views },
          ]
            .filter((item) => item !== null)
            .map((item) => (
              <li key={item.label} className="text-sm">
                <span className="font-mono tabular-nums text-accent">
                  {formatCompactNumber(item.value)}
                </span>{" "}
                <span className="font-medium text-muted">{item.label}</span>
              </li>
            ))}
        </ul>
      )}

      {!videos && (
        <p className="mt-8 text-sm text-muted">Video data is temporarily unavailable.</p>
      )}

      {videos && videos.length === 0 && (
        <p className="mt-8 text-sm text-muted">No videos published yet.</p>
      )}

      {videos && videos.length > 0 && (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {videos.map((video) => (
            <li key={video.id}>
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="aspect-video w-full overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    loading="lazy"
                    className="size-full object-cover transition-opacity group-hover:opacity-80"
                  />
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-semibold text-foreground">
                  {video.title}
                </p>
                <p className="mt-1 text-xs font-medium text-muted">
                  {formatViews(video.views)} · {formatDate(video.publishedAt)}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
