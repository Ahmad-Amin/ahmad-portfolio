import { getLatestVideos, TECHWITHSWAG_CHANNEL_ID } from "@/lib/youtube";

interface YoutubeRowProps {
  index: number;
}

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(views >= 10000 ? 0 : 1)}K views`;
  return `${views} views`;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export async function YoutubeRow({ index }: YoutubeRowProps) {
  const videos = await getLatestVideos(TECHWITHSWAG_CHANNEL_ID);

  return (
    <li className="border-b-2 border-foreground px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[5rem_1fr] lg:gap-8">
        <span className="font-mono text-sm text-accent">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div>
          <h3 className="text-xl font-bold text-foreground">YouTube</h3>
          <p className="mt-1 text-muted">
            Videos where I break down what I&apos;m building and what I&apos;ve learned.
          </p>

          {!videos && (
            <p className="mt-6 font-mono text-sm text-muted">
              Video data is temporarily unavailable.
            </p>
          )}

          {videos && videos.length === 0 && (
            <p className="mt-6 font-mono text-sm text-muted">No videos published yet.</p>
          )}

          {videos && videos.length > 0 && (
            <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {videos.map((video) => (
                <li key={video.id}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="aspect-video w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        loading="lazy"
                        className="size-full object-cover transition-opacity group-hover:opacity-80"
                      />
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm font-bold text-foreground">
                      {video.title}
                    </p>
                    <p className="mt-1 font-mono text-xs tracking-wide text-muted uppercase">
                      {formatViews(video.views)} · {formatDate(video.publishedAt)}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}
