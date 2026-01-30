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
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
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
      { error: `Failed to fetch/parse RSS: ${err?.message}`, details: err?.message },
      { status: 400 },
    );
  }

  const podcastTitle = feed.title || 'Untitled podcast';
  const podcastDescription = feed.description || '';
  const podcastImage =
    (feed as any).image?.url ||
    (feed as any)['itunes:image']?.href ||
    null;

  // Check if THIS USER already has this podcast
  const { data: existingPodcast } = await supabase
    .from('podcasts')
    .select('id')
    .eq('rss_url', rssUrl)
    .eq('owner_id', user.id)
    .maybeSingle();

  let podcast;
  let podcastError;

  if (existingPodcast) {
    // Update existing
    const { data, error } = await supabase
      .from('podcasts')
      .update({
        title: podcastTitle,
        description: podcastDescription,
        primary_color: '#0ea5e9',
        accent_color: '#22c55e',
      })
      .eq('id', existingPodcast.id)
      .select()
      .single();
    podcast = data;
    podcastError = error;
  } else {
    // Insert new
    const { data: inserted, error: insertError } = await supabase
      .from('podcasts')
      .insert({
        owner_id: user.id,
        title: podcastTitle,
        description: podcastDescription,
        primary_color: '#0ea5e9',
        accent_color: '#22c55e',
        rss_url: rssUrl,
      })
      .select()
      .single();

    if (insertError?.code === '23505') {
      return NextResponse.json(
        { error: 'Database Restriction: The system is blocking duplicates. Please run the SQL migration I provided to allow multiple users to own the same feed.', code: 'DB_CONSTRAINT' },
        { status: 409 }
      );
    }

    podcast = inserted;
    podcastError = insertError;
  }

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
