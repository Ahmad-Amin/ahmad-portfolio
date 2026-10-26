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

// A channel's uploads live in a playlist whose id is the channel id with "UC" swapped
// for "UU". The Data API lists it for 1 quota unit per call.
async function getVideosFromApi(channelId: string, limit: number): Promise<YoutubeVideo[] | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key || !channelId.startsWith("UC")) return null;

  try {
    const playlistId = `UU${channelId.slice(2)}`;
    const listRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${limit + 2}&key=${key}`,
      { next: { revalidate: 3600 } },
    );
    if (!listRes.ok) return null;

    const list = (await listRes.json()) as {
      items?: {
        snippet?: {
          title?: string;
          publishedAt?: string;
          thumbnails?: Record<string, { url?: string }>;
        };
        contentDetails?: { videoId?: string; videoPublishedAt?: string };
      }[];
    };

    // Private and deleted videos still show up in the playlist, with placeholder titles.
    const items = (list.items ?? [])
      .filter((item) => item.contentDetails?.videoId)
      .filter((item) => !/^(private|deleted) video$/i.test(item.snippet?.title ?? ""))
      .slice(0, limit);
    if (items.length === 0) return [];

    // View counts aren't in the playlist response, so ask for them in one more call.
    const ids = items.map((item) => item.contentDetails!.videoId!).join(",");
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${key}`,
      { next: { revalidate: 3600 } },
    );
    const views = new Map<string, number>();
    if (statsRes.ok) {
      const stats = (await statsRes.json()) as {
        items?: { id: string; statistics?: { viewCount?: string } }[];
      };
      for (const entry of stats.items ?? []) views.set(entry.id, Number(entry.statistics?.viewCount ?? 0));
    }

    return items.map((item) => {
      const id = item.contentDetails!.videoId!;
      const thumbs = item.snippet?.thumbnails ?? {};
      return {
        id,
        title: item.snippet?.title ?? "",
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnailUrl: (thumbs.medium ?? thumbs.high ?? thumbs.default)?.url ?? "",
        publishedAt: item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt ?? "",
        views: views.get(id) ?? 0,
      };
    });
  } catch {
    return null;
  }
}

// Tries the Data API first, then the public RSS feed. YouTube's feed has been known to
// return 404 for stretches at a time, so it's the fallback, not the only source.
export async function getLatestVideos(
  channelId: string,
  limit = 3,
): Promise<YoutubeVideo[] | null> {
  return (await getVideosFromApi(channelId, limit)) ?? (await getVideosFromFeed(channelId, limit));
}

async function getVideosFromFeed(channelId: string, limit: number): Promise<YoutubeVideo[] | null> {
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
