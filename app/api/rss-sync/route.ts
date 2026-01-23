// app/api/rss-sync/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { fetchRssEpisodes } from '@/lib/rss/parseRss';
import { slugify } from '@/lib/utils/slugify';

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // TEMP: no auth check so we can develop the pipeline
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();
  // if (!user) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const { rssUrl } = await req.json();
  if (!rssUrl) {
    return NextResponse.json({ error: 'rssUrl required' }, { status: 400 });
  }

  const data = await fetchRssEpisodes(rssUrl);

  // Podcast upsert – assumes you added a UNIQUE constraint on podcasts.rss_url
  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .upsert(
      {
        // user_id: user?.id ?? null,   // add back later when auth is stable
        rss_url: rssUrl,
        title: data.title,
        description: data.description,
        cover_image_url: data.image,
      },
      { onConflict: 'rss_url' }
    )
    .select()
    .single();

  if (podcastError || !podcast) {
    return NextResponse.json(
      { error: podcastError?.message ?? 'Error upserting podcast' },
      { status: 500 }
    );
  }

  // Episodes upsert – relies on UNIQUE (podcast_id, guid) in episodes table
  for (const ep of data.episodes) {
    const guid = ep.guid || ep.enclosureUrl || ep.title;
    if (!guid) continue;

    const slug = slugify(ep.title || guid);

    await supabase.from('episodes').upsert(
      {
        podcast_id: podcast.id,
        guid,
        title: ep.title,
        slug,
        description: ep.content,
        audio_url: ep.enclosureUrl,
        image_url: ep.imageUrl,
        published_at: ep.pubDate ? new Date(ep.pubDate).toISOString() : null,
      },
      { onConflict: 'podcast_id,guid' }
    );
  }

  return NextResponse.json({ ok: true, podcastId: podcast.id });
}
