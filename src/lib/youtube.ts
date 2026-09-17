// Resolved once from the @TechWithSwag handle (channel IDs are permanent, so
// there's no need to re-resolve the handle to an ID on every request).
export const TECHWITHSWAG_CHANNEL_ID = "UCW5W5TuR0oIPRkW-lqEAs8g";

export interface YoutubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  views: number;
}

function unescapeXml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extract(pattern: RegExp, text: string): string | null {
  return text.match(pattern)?.[1] ?? null;
}

export interface ChannelStats {
  // null when the channel owner has hidden their subscriber count.
  subscribers: number | null;
  videos: number;
  views: number;
}

export async function getChannelStats(channelId: string): Promise<ChannelStats | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${key}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;

    const json = (await res.json()) as {
      items?: {
        statistics: {
          subscriberCount?: string;
          hiddenSubscriberCount?: boolean;
          videoCount: string;
          viewCount: string;
        };
      }[];
    };

    const stats = json.items?.[0]?.statistics;
    if (!stats) return null;

    return {
      subscribers: stats.hiddenSubscriberCount ? null : Number(stats.subscriberCount ?? 0),
      videos: Number(stats.videoCount),
      views: Number(stats.viewCount),
    };
  } catch {
    return null;
  }
}

export async function getLatestVideos(
  channelId: string,
  limit = 3,
): Promise<YoutubeVideo[] | null> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1);

    const videos: YoutubeVideo[] = entries.slice(0, limit).map((entry) => {
      const id = extract(/<yt:videoId>(.*?)<\/yt:videoId>/, entry) ?? "";
      const title = unescapeXml(extract(/<title>(.*?)<\/title>/, entry) ?? "");
      const publishedAt = extract(/<published>(.*?)<\/published>/, entry) ?? "";
      const thumbnailUrl = extract(/<media:thumbnail url="(.*?)"/, entry) ?? "";
      const viewsRaw = extract(/<media:statistics views="(.*?)"/, entry);

      return {
        id,
        title,
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnailUrl,
        publishedAt,
        views: viewsRaw ? parseInt(viewsRaw, 10) : 0,
      };
    });

    return videos.filter((video) => video.id !== "");
  } catch {
    return null;
  }
}
