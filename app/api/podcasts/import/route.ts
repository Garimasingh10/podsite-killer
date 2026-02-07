// app/api/podcasts/import/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { parseRss } from '@/lib/rss/parseRss';
import { slugify } from '@/lib/utils/slugify';
import { extractColorsFromImage } from '@/lib/utils/colorUtils';

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

  let parsed;
  try {
    parsed = await parseRss(rssUrl);
  } catch (err: any) {
    console.error('Failed to parse RSS', err);
    return NextResponse.json(
      { error: `Failed to fetch/parse RSS: ${err?.message}` },
      { status: 400 },
    );
  }

  // 1. EXTRACT COLORS for "Magic Onboarding" (Milestone 2.2)
  let themeConfig = {
    primaryColor: '#0ea5e9',
    backgroundColor: '#0f172a',
    foregroundColor: '#f8fafc',
    accentColor: '#22c55e',
    borderColor: '#334155',
    layout: 'netflix',
  };

  if (parsed.image) {
    try {
      const extracted = await extractColorsFromImage(parsed.image);
      themeConfig = {
        ...themeConfig,
        primaryColor: extracted.primary,
        backgroundColor: extracted.background,
        foregroundColor: extracted.foreground,
        accentColor: extracted.accent,
        borderColor: extracted.border,
      };
    } catch (e) {
      console.warn('Color extraction failed during import', e);
    }
  }

  // YouTube detection is now handled by parseRss lib
  const detectedYtId = parsed.youtube_channel_id;

  // Check if THIS USER already has this podcast
  const { data: existingPodcast } = await supabase
    .from('podcasts')
    .select('id')
    .eq('rss_url', rssUrl)
    .eq('owner_id', user.id)
    .maybeSingle();

  let podcast;
  let podcastError;

  const podcastData = {
    owner_id: user.id,
    title: parsed.title || 'Untitled podcast',
    description: parsed.description || '',
    rss_url: rssUrl,
    image_url: parsed.image,
    primary_color: themeConfig.primaryColor,
    accent_color: themeConfig.accentColor,
    youtube_channel_id: detectedYtId,
    theme_config: themeConfig,
    page_layout: ['hero', 'shorts', 'subscribe', 'grid', 'host'],
  };

  if (existingPodcast) {
    const { data, error } = await supabase
      .from('podcasts')
      .update(podcastData)
      .eq('id', existingPodcast.id)
      .select()
      .single();
    podcast = data;
    podcastError = error;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from('podcasts')
      .insert(podcastData)
      .select()
      .single();

    podcast = inserted;
    podcastError = insertError;
  }

  if (podcastError || !podcast) {
    return NextResponse.json(
      { error: podcastError?.message ?? 'Error upserting podcast' },
      { status: 500 },
    );
  }

  let episodesProcessed = 0;
  // We limit to 150 episodes for performance
  const episodesToProcess = parsed.episodes.slice(0, 150);

  for (const ep of episodesToProcess) {
    const guid = ep.guid;
    const slug = slugify(ep.title || guid);

    const { error } = await supabase.from('episodes').upsert(
      {
        podcast_id: podcast.id,
        guid,
        slug,
        title: ep.title,
        description: ep.description,
        audio_url: ep.audio_url,
        image_url: ep.episode_image_url,
        published_at: ep.publish_date,
        duration_seconds: ep.duration_seconds,
      },
      { onConflict: 'podcast_id,guid' },
    );

    if (!error) episodesProcessed += 1;
  }

  return NextResponse.json({
    ok: true,
    podcastId: podcast.id,
    episodesProcessed,
    totalItems: parsed.episodes.length,
    theme: themeConfig,
  });
}
