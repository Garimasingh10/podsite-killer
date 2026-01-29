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
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { rssUrl } = (await req.json().catch(() => ({ rssUrl: null }))) as {
    rssUrl: string | null;
  };

  if (!rssUrl) {
    return NextResponse.json({ error: 'rssUrl required' }, { status: 400 });
  }

  let feed;
  try {
    feed = await parser.parseURL(rssUrl);
  } catch (err: any) {
    console.error('Failed to fetch/parse RSS', err);
    return NextResponse.json(
      { error: 'Failed to fetch/parse RSS', details: err?.message },
      { status: 500 },
    );
  }

  const podcastTitle = feed.title || 'Untitled podcast';
  const podcastDescription = feed.description || '';
  const podcastImage =
    (feed as any).image?.url ||
    (feed as any)['itunes:image']?.href ||
    null;

  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .upsert(
      {
        owner_id: session.user.id,
        title: podcastTitle,
        description: podcastDescription,
        // image_url: podcastImage,
        // cover_image_url: podcastImage,
        primary_color: '#0ea5e9',
        accent_color: '#22c55e',
        rss_url: rssUrl,
      },
      { onConflict: 'rss_url' },
    )
    .select()
    .single();

  if (podcastError || !podcast) {
    console.error('podcast upsert error', podcastError);
    return NextResponse.json(
      { error: podcastError?.message ?? 'Error upserting podcast' },
      { status: 500 },
    );
  }

  let episodesProcessed = 0;

  // LIMIT: avoid super long imports on huge feeds
  const items = (feed.items ?? []).slice(0, 150);

  for (const item of items) {
    const guid = item.guid || item.link || item.title;
    if (!guid) continue;

    const slug = String(guid)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

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
      (feed as any).image?.url ||
      null;
    const publishedAt = item.isoDate
      ? new Date(item.isoDate).toISOString()
      : null;

    const { error } = await supabase.from('episodes').upsert(
      {
        podcast_id: podcast.id,
        guid,
        slug,
        title: item.title || '(Untitled)',
        description,
        audio_url: audioUrl,
        image_url: imageUrl,
        published_at: publishedAt,
      },
      { onConflict: 'podcast_id,guid' },
    );

    if (!error) {
      episodesProcessed += 1;
    } else {
      console.error('episode upsert error', error, {
        podcastId: podcast.id,
        guid,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    podcastId: podcast.id,
    episodesProcessed,
    feedItems: feed.items?.length ?? 0,
    processedLimit: items.length,
  });
}
