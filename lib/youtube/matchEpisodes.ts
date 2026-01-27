// lib/youtube/matchEpisodes.ts
import type { YoutubeVideo } from './fetchChannelVideos';

type Episode = { id: string; title: string | null };

function normalizeTitle(str: string) {
  return str
    .toLowerCase()
    .replace(/^the daily[:\-–]\s*/g, '')
    .replace(/\|\s*the daily.*$/g, '')
    .replace(/[()[\]'".,!?]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function similarity(a: string, b: string) {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (!na || !nb) return 0;

  const setA = new Set(na.split(' '));
  const setB = new Set(nb.split(' '));

  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;

  return union === 0 ? 0 : intersection / union;
}

export function matchEpisodesToVideos(
  episodes: Episode[],
  videos: YoutubeVideo[],
  threshold = 0.25,
): { episodeId: string; videoId: string }[] {
  const matches: { episodeId: string; videoId: string }[] = [];

  for (const ep of episodes) {
    if (!ep.title) continue;

    let bestScore = 0;
    let bestVideo: YoutubeVideo | null = null;

    for (const video of videos) {
      const score = similarity(ep.title, video.title);
      if (score > bestScore) {
        bestScore = score;
        bestVideo = video;
      }
    }

    if (bestVideo && bestScore >= threshold) {
      matches.push({ episodeId: ep.id, videoId: bestVideo.videoId });
    }
  }

  return matches;
}
```[]

```ts
// app/api/youtube-sync/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { fetchChannelVideos } from '@/lib/youtube/fetchChannelVideos';
import { matchEpisodesToVideos } from '@/lib/youtube/matchEpisodes';

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { podcastId } = await req.json();
  if (!podcastId) {
    return NextResponse.json({ error: 'podcastId required' }, { status: 400 });
  }

  const { data: podcast } = await supabase
    .from('podcasts')
    .select('id, owner_id, youtube_channel_id')
    .eq('id', podcastId)
    .maybeSingle();

  if (!podcast || podcast.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!podcast.youtube_channel_id) {
    return NextResponse.json(
      { error: 'No youtube_channel_id set' },
      { status: 400 },
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing YOUTUBE_API_KEY' },
      { status: 500 },
    );
  }

  const videos = await fetchChannelVideos(podcast.youtube_channel_id, apiKey, 50);

  const { data: episodes } = await supabase
    .from('episodes')
    .select('id, title')
    .eq('podcast_id', podcast.id);

  const matches = matchEpisodesToVideos(episodes ?? [], videos, 0.25);

  let updated = 0;
  for (const match of matches) {
    const { error } = await supabase
      .from('episodes')
      .update({ youtube_video_id: match.videoId })
      .eq('id', match.episodeId);

    if (!error) updated += 1;
  }

  return NextResponse.json({ ok: true, matched: matches.length, updated });
}
