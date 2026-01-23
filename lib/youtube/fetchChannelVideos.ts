// lib/youtube/fetchChannelVideos.ts

export type YoutubeVideo = {
  videoId: string;
  title: string;
  publishedAt: string;
};


export async function fetchLastVideos(
  channelId: string,
  apiKey: string,
  maxResults: number,
): Promise<YoutubeVideo[]> {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', apiKey);
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('type', 'video');

  const res = await fetch(url.toString());
  const json = await res.json();

  console.log('fetchLastVideos raw json', JSON.stringify(json).slice(0, 500));

  if (!res.ok) {
    throw new Error(json.error?.message || 'YouTube API error');
  }

  const items = (json.items || []).map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    publishedAt: item.snippet.publishedAt,
  }));

  return items;
}
