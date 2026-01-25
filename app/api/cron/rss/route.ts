// app/api/cron/rss/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { fetchRssEpisodes } from '@/lib/rss/parseRss';

type PodcastRow = {
  id: string;
  rss_url: string | null;
};

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data: podcasts, error: podcastsError } = await supabase
    .from('podcasts')
    .select('id, rss_url');

  if (podcastsError) {
    console.error('podcastsError', podcastsError);
    return NextResponse.json(
      { ok: false, error: podcastsError.message },
      { status: 500 },
    );
  }

  if (!podcasts || podcasts.length === 0) {
    return NextResponse.json({ ok: true, message: 'No podcasts found' });
  }

  let totalEpisodesProcessed = 0;
  const errors: Array<{ podcastId: string; error: string }> = [];

  for (const p of podcasts as PodcastRow[]) {
    if (!p.rss_url) continue;

    try {
      const data = await fetchRssEpisodes(p.rss_url);

      for (const ep of data.episodes) {
        const guid = ep.guid || ep.enclosureUrl || ep.title;
        if (!guid) continue;

        const { error: upsertError } = await supabase.from('episodes').upsert(
          {
            podcast_id: p.id,
            guid,
            title: ep.title,
            description: ep.content,
            audio_url: ep.enclosureUrl,
            image_url: ep.imageUrl,
            published_at: ep.pubDate
              ? new Date(ep.pubDate).toISOString()
              : null,
          },
          { onConflict: 'podcast_id,guid' },
        );

        if (upsertError) {
          console.error('episode upsert error', upsertError, {
            podcastId: p.id,
            guid,
          });
          errors.push({
            podcastId: p.id,
            error: upsertError.message ?? 'Unknown upsert error',
          });
        } else {
          totalEpisodesProcessed += 1;
        }
      }
    } catch (err: any) {
      console.error('rss fetch/parse error', err, { podcastId: p.id });
      errors.push({
        podcastId: p.id,
        error: err?.message ?? 'RSS fetch/parse failed',
      });
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    message: `RSS sync finished. Episodes processed: ${totalEpisodesProcessed}. Errors: ${errors.length}.`,
    errors,
  });
}
