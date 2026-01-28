// app/api/podcasts/import/route.ts
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const parser = new Parser({
  customFields: {
    item: [['content:encoded', 'contentEncoded']],
  },
});

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const { rssUrl } = await req.json().catch(() => ({ rssUrl: null }));
  if (!rssUrl) {
    return NextResponse.json({ error: 'rssUrl required' }, { status: 400 });
  }

  let feed;
  try {
    feed = await parser.parseURL(rssUrl);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch/parse RSS', details: err?.message },
      { status: 500 },
    );
  }

  // upsert podcast by rss_url
  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .upsert(
      {
        rss_url: rssUrl,
        title: feed.title || 'Untitled podcast',
        description: feed.description || '',
        image_url: feed.image?.url || null,
      },
      { onConflict: 'rss_url' },
    )
    .select()
    .single();

  if (podcastError || !podcast) {
    return NextResponse.json(
      { error: podcastError?.message ?? 'Error upserting podcast' },
      { status: 500 },
    );
  }

  let episodesProcessed = 0;

  for (const item of feed.items) {
    const guid = item.guid || item.link || item.title;
    if (!guid) continue;

    const enclosure = item.enclosure as { url?: string } | undefined;
    const audioUrl = enclosure?.url || null;
    const description =
      (item as any).contentEncoded ||
      item.content ||
      item.contentSnippet ||
      '';
    const imageUrl =
      (item as any)['itunes:image']?.href ||
      (item as any).image?.url ||
      feed.image?.url ||
      null;
    const publishedAt = item.isoDate
      ? new Date(item.isoDate).toISOString()
      : null;

    const { error } = await supabase.from('episodes').upsert(
      {
        podcast_id: podcast.id,
        guid,
        title: item.title || '(Untitled)',
        description,
        audio_url: audioUrl,
        image_url: imageUrl,
        published_at: publishedAt,
      },
      { onConflict: 'podcast_id,guid' },
    );

    if (!error) episodesProcessed += 1;
  }

  return NextResponse.json({
    ok: true,
    podcastId: podcast.id,
    episodesProcessed,
  });
}
