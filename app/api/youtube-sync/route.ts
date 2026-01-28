// app/api/youtube-sync/route.ts
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
  const supabase = createSupabaseServerClient();

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
      { error: 'podcastId and channelId required', bodySeenByServer: body },
      { status: 400 },
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'YOUTUBE_API_KEY not configured' },
      { status: 500 },
    );
  }

  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .select('id')
    .eq('id', podcastId)
    .maybeSingle();

  if (podcastError || !podcast) {
    return NextResponse.json(
      { error: 'Podcast not found' },
      { status: 404 },
    );
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
    (episodesRaw as { id: string; title: string | null; published_at: string | null }[]) ??
    [];

  if (!episodes.length) {
    return NextResponse.json(
      { error: 'No episodes to match' },
      { status: 404 },
    );
  }

  const videos = await fetchChannelUploads(apiKey, channelId, 50);

  if (!videos.length) {
    return NextResponse.json(
      { error: 'No videos returned for this channelId' },
      { status: 404 },
    );
  }

  // STRICter matching: at most 30, min similarity 0.5
  const pairings = matchEpisodesToVideos(episodes, videos, 30, 0.5);

  for (const { episodeId, videoId } of pairings) {
    await supabase
      .from('episodes')
      .update({ youtube_video_id: videoId })
      .eq('id', episodeId);
  }

  return NextResponse.json({
    ok: true,
    videosFetched: videos.length,
    matchedCount: pairings.length,
  });
}
