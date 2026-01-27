// lib/youtube/fetchChannelVideos.ts
export type YoutubeVideo = {
  videoId: string;
  title: string;
};

export async function fetchChannelVideos(
  channelId: string,
  apiKey: string,
  max = 50,
): Promise<YoutubeVideo[]> {
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('key', apiKey);
  searchUrl.searchParams.set('channelId', channelId);
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('order', 'date');
  searchUrl.searchParams.set('maxResults', String(max));
  searchUrl.searchParams.set('type', 'video');

  const res = await fetch(searchUrl.toString());
  if (!res.ok) throw new Error('YouTube search failed');

  const json = await res.json();

  return (json.items ?? []).map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title as string,
  }));
}
