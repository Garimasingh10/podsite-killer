const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  throw new Error('Missing YOUTUBE_API_KEY');
}

// after the guard, assert type so TS stops complaining
const YT_API_KEY: string = YOUTUBE_API_KEY;

export async function fetchChannelVideos(channelId: string) {
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('key', YT_API_KEY);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('channelId', channelId);
  url.searchParams.set('order', 'date');
  url.searchParams.set('maxResults', '10');

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error: ${res.status} ${text}`);
  }
  return res.json();
}
