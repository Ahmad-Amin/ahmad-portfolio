import { getLatestVideos, TECHWITHSWAG_CHANNEL_ID } from "@/lib/youtube";
import { Panel } from "@/components/panel";

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(views >= 10000 ? 0 : 1)}K views`;
  return `${views} views`;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export async function YoutubeRow() {
  const videos = await getLatestVideos(TECHWITHSWAG_CHANNEL_ID);

  return (
    <Panel as="li">
      <h3 className="text-xl font-semibold text-foreground">YouTube</h3>
      <p className="mt-1 text-muted">
        Videos where I break down what I&apos;m building and what I&apos;ve learned.
      </p>

      {!videos && (
        <p className="mt-6 text-sm text-muted">Video data is temporarily unavailable.</p>
      )}

      {videos && videos.length === 0 && (
        <p className="mt-6 text-sm text-muted">No videos published yet.</p>
      )}

      {videos && videos.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
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
