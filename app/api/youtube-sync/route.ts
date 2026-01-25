// app/api/youtube-sync/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { fetchChannelVideos } from '@/lib/youtube/fetchChannelVideos';
import { matchEpisodesToVideos } from '@/lib/youtube/matchEpisodes';

type YoutubeSyncBody = {
  podcastId: string;
  youtubeChannelId: string;
};

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  let body: YoutubeSyncBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { podcastId, youtubeChannelId } = body;

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

  console.log('youtube-sync start', { podcastId, youtubeChannelId });

  try {
    // 1) Fetch videos from channel
    const videos = await fetchChannelVideos(youtubeChannelId, apiKey, 50);
    console.log('youtube-sync videos count', videos.length);
    console.log('youtube-sync sample videos', videos.slice(0, 3));

    if (videos.length === 0) {
      return NextResponse.json(
        { error: 'No videos returned for this channelId' },
        { status: 404 },
      );
    }

    // 2) Load episodes for this podcast
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('id, title')                // change "id" if your PK is named differently
      .eq('podcast_id', podcastId);       // must equal episodes.podcast_id

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

    // 3) Match
    const matches = matchEpisodesToVideos(episodes, videos, 0.2);
    console.log('youtube-sync matches', matches);

    if (matches.length === 0) {
      return NextResponse.json(
        { ok: true, matchesCount: 0, message: 'No matches above threshold' },
        { status: 200 },
      );
    }

    // 4) Update episodes.youtube_video_id
    for (const match of matches) {
      const { data, error: updateError } = await supabase
        .from('episodes')
        .update({ youtube_video_id: match.videoId })
        .eq('id', match.episodeId)        // change "id" here if PK is named differently
        .select('id, youtube_video_id');

      if (updateError) {
        console.error('youtube-sync update error', updateError, match);
      } else {
        console.log('youtube-sync updated rows', data);
      }
    }

    return NextResponse.json({ ok: true, matchesCount: matches.length });
  } catch (err: any) {
    console.error('youtube-sync unexpected error', err);
    return NextResponse.json(
      { error: err?.message || 'Unknown YouTube sync error' },
      { status: 500 },
    );
  }
}
