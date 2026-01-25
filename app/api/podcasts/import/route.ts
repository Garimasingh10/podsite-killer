// app/api/podcasts/import/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { fetchRssEpisodes } from '@/lib/rss/parseRss';

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  // 1) Parse JSON body
  let body: { rssUrl: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { rssUrl } = body;
  if (!rssUrl) {
    return NextResponse.json(
      { error: 'rssUrl required' },
      { status: 400 },
    );
  }

  // 2) Fetch & parse RSS
  let parsed;
  try {
    parsed = await fetchRssEpisodes(rssUrl);
  } catch (e: any) {
    console.error('fetchRssEpisodes error', e);
    return NextResponse.json(
      { error: e?.message || 'Failed to parse RSS' },
      { status: 502 },
    );
  }

  const podcast = {
    title: parsed.title ?? 'Untitled podcast',
    description: parsed.description ?? '',
    imageUrl: parsed.image ?? null,
  };

  const episodes = parsed.episodes ?? [];

  // 3) Upsert podcast row, keyed by rss_url
  const { data: podcastRow, error: podcastError } = await supabase
    .from('podcasts')
    .upsert(
      {
        title: podcast.title,
        description: podcast.description,
        image_url: podcast.imageUrl,
        rss_url: rssUrl,
      },
      { onConflict: 'rss_url' },
    )
    .select()
    .single();

  if (podcastError || !podcastRow) {
    console.error('podcast upsert error', podcastError);
    return NextResponse.json(
      { error: podcastError?.message ?? 'Failed to upsert podcast' },
      { status: 500 },
    );
  }

  const podcastId = podcastRow.id as string;

  // 4) Upsert episodes
  for (const ep of episodes) {
    // Always have a base id for the episode
    const guid = ep.guid || ep.title || crypto.randomUUID();

    const slug = String(guid)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { error: epError } = await supabase.from('episodes').upsert({
      id: guid,
      podcast_id: podcastId,
      title: ep.title ?? 'Untitled episode',
      slug, // always set
      description: ep.content ?? '',
      audio_url: ep.enclosureUrl ?? null,
      published_at: ep.pubDate ?? null,
      // store episode image if your parser returns ep.imageUrl
      image_url: (ep as any).imageUrl ?? null,
    });

    if (epError) {
      console.error('episode upsert error', epError, {
        podcastId,
        guid,
      });
    }
  }

  return NextResponse.json({ ok: true, podcastId });
}
