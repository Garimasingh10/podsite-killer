import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { fetchChannelUploads } from '@/lib/youtube/fetchUploads';
import { matchEpisodesToVideos } from '@/lib/youtube/matchEpisodes';

type YoutubeSyncBody = {
  podcastId?: string;
  channelId?: string;
  youtubeChannelId?: string;
};

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  let body: YoutubeSyncBody;
  try {
    body = (await req.json()) as YoutubeSyncBody;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const podcastId = body.podcastId;
  const channelId = body.channelId ?? body.youtubeChannelId;

  if (!podcastId || !channelId) {
    return NextResponse.json(
      {
        error: 'podcastId and channelId required',
        bodySeenByServer: body,
      },
      { status: 400 },
    );
  }

  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .select('id, owner_id, youtube_channel_id')
    .eq('id', podcastId)
    .maybeSingle();

  if (podcastError || !podcast) {
    return NextResponse.json(
      { error: 'Podcast not found' },
      { status: 404 },
    );
  }

  // Optional: store the channel id on the podcast
  if (podcast.youtube_channel_id !== channelId) {
    await supabase
      .from('podcasts')
      .update({ youtube_channel_id: channelId })
      .eq('id', podcastId);
  }

  const { data: episodesRaw, error: episodesError } = await supabase
    .from('episodes')
    .select('id, title, published_at')
    .eq('podcast_id', podcast.id)
    .order('published_at', { ascending: false });

  if (episodesError) {
    return NextResponse.json(
      { error: episodesError.message },
      { status: 500 },
    );
  }

  const episodes =
    (episodesRaw as {
      id: string;
      title: string | null;
      published_at: string | null;
    }[]) ?? [];

  if (!episodes.length) {
    return NextResponse.json(
      { error: 'No episodes to match' },
      { status: 404 },
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server misconfiguration: YOUTUBE_API_KEY is missing' },
      { status: 500 },
    );
  }

  // Fetch last 50 uploads using your helper
  const videos = await fetchChannelUploads(apiKey, channelId);

  if (!videos.length) {
    return NextResponse.json(
      { error: 'No videos returned for this channelId' },
      { status: 404 },
    );
  }

  // matchEpisodesToVideos(episodes, videos)
  const pairings = matchEpisodesToVideos(
    episodes.map((e) => ({
      id: e.id,
      title: e.title ?? '',
      published_at: e.published_at,
    })),
    videos,
  );

  for (const { episodeId, videoId } of pairings) {
    await supabase
      .from('episodes')
      .update({ youtube_video_id: videoId })
      .eq('id', episodeId);
  }

  return NextResponse.json({
    ok: true,
    receivedPodcastId: podcastId,
    receivedChannelId: channelId,
    videosFetched: videos.length,
    matchedCount: pairings.length,
  });
}
