// app/api/youtube-sync/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { fetchLatestVideos, matchEpisodesToVideos } from '@/lib/youtube';

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
    .select('id, title')
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
    }[]) ?? [];

  if (!episodes.length) {
    return NextResponse.json(
      { error: 'No episodes to match' },
      { status: 404 },
    );
  }

  // Fetch last 50 uploads using your helper
  const videos = await fetchLatestVideos(channelId);

  if (!videos.length) {
    return NextResponse.json(
      { error: 'No videos returned for this channelId' },
      { status: 404 },
    );
  }

  // matchEpisodesToVideos(episodes, videos) expects titles, we guard against null
  const pairings = matchEpisodesToVideos(
    episodes.map((e) => ({
      id: e.id,
      title: e.title ?? '',
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
