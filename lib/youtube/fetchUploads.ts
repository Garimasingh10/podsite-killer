export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
};

export async function fetchChannelUploads(
  apiKey: string,
  channelId: string,
  maxResults = 100,
): Promise<YouTubeVideo[]> {
  // 1) Get uploads playlist for channel
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
    { cache: 'no-store' },
  );

  if (!channelRes.ok) return [];

  const channelJson = await channelRes.json();
  const uploadsPlaylistId =
    channelJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) return [];

  // 2) Get videos from uploads playlist
  const playlistRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`,
    { cache: 'no-store' },
  );

  if (!playlistRes.ok) return [];

  const playlistJson = await playlistRes.json();

  const videos: YouTubeVideo[] =
    playlistJson.items?.map((item: any) => ({
      id: item.snippet.resourceId.videoId as string,
      title: item.snippet.title as string,
      description: item.snippet.description as string,
      publishedAt: item.snippet.publishedAt as string,
    })) ?? [];

  return videos;
}
