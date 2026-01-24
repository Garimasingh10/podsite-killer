// lib/youtube/fetchChannelVideos.ts
export type YoutubeVideo = {
  videoId: string;
  title: string;
};

const BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

export async function fetchChannelVideos(
  channelId: string,
  apiKey: string,
  maxResults = 50,
): Promise<YoutubeVideo[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('type', 'video');

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error: ${res.status} ${text}`);
  }
  const data = await res.json();

  const items = (data.items ?? []) as any[];

  return items
    .map((item) => {
      const vid = item.id?.videoId;
      const title = item.snippet?.title;
      if (!vid || !title) return null;
      return { videoId: vid as string, title: title as string };
    })
    .filter(Boolean) as YoutubeVideo[];
}
