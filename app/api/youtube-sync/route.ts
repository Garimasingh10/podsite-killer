// app/api/youtube-sync/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { fetchLastVideos } from '@/lib/youtube/fetchChannelVideos';
import { matchEpisodesToVideos } from '@/lib/youtube/matchEpisodes';

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // Auth disabled for now
  // const {
  //   data: { user },
  //   error: authError,
  // } = await supabase.auth.getUser();
  // if (authError) console.error('youtube-sync auth error', authError);
  // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { podcastId, youtubeChannelId } = await req.json();

  if (!podcastId || !youtubeChannelId) {
    return NextResponse.json(
      { error: 'podcastId and youtubeChannelId required' },
      { status: 400 },
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'YOUTUBE_API_KEY not set' },
      { status: 500 },
    );
  }

  // 1. Fetch recent videos from the channel
  const videos = await fetchLastVideos(youtubeChannelId, apiKey, 50);
  console.log('youtube-sync videos count', videos.length);

  // 2. Load episodes for this podcast
  const { data: episodes, error: episodesError } = await supabase
    .from('episodes')
    .select('id, title')
    .eq('podcast_id', podcastId);

  if (episodesError) {
    console.error('youtube-sync episodes error', episodesError);
    return NextResponse.json(
      { error: episodesError.message },
      { status: 500 },
    );
  }

  if (!episodes || episodes.length === 0) {
    console.warn('youtube-sync: no episodes for podcast', podcastId);
    return NextResponse.json({ error: 'No episodes' }, { status: 404 });
  }

  console.log('youtube-sync episodes count', episodes.length);

  // 3. Match episodes to videos
  const matches = matchEpisodesToVideos(episodes, videos);
  console.log('youtube-sync matches', matches);

  // 4. Update episodes with matched YouTube video ids
  for (const match of matches) {
    const { error: updateError } = await supabase
      .from('episodes')
      .update({ youtube_video_id: match.videoId })
      .eq('id', match.episodeId);

    if (updateError) {
      console.error('youtube-sync update error', updateError, match);
    }
  }

  // 5. Store integration info (auth disabled → user_id null is ok for now)
  const { error: integrationError } = await supabase.from('integrations').upsert({
    user_id: null,
    podcast_id: podcastId,
    youtube_channel_id: youtubeChannelId,
  });

  if (integrationError) {
    console.error('youtube-sync integration upsert error', integrationError);
  }

  return NextResponse.json({ ok: true, matchesCount: matches.length });
}
