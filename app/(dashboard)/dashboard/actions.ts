'use server';

import Parser from 'rss-parser';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type EpisodeItem = {
  guid?: string;
  title?: string;
  link?: string;
  enclosure?: { url?: string };
  'content:encoded'?: string;
  content?: string;
  isoDate?: string;
  pubDate?: string;
};

export async function syncRssAction(podcastId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .select('id, rss_url, owner_id')
    .eq('id', podcastId)
    .eq('owner_id', user.id)
    .single();

  if (podcastError || !podcast || !podcast.rss_url) {
    console.error('syncRssAction podcast error', podcastError);
    return;
  }

  const parser = new Parser();
  const feed = await parser.parseURL(podcast.rss_url);

  const items = (feed.items as EpisodeItem[]) ?? [];

  for (const item of items) {
    const guid = item.guid || item.link || item.title;
    if (!guid) continue;

    const audioUrl = item.enclosure?.url ?? null;
    const description =
      (item as any)['content:encoded'] || item.content || null;
    const title = item.title ?? '(Untitled episode)';
    const publishedAt = item.isoDate || item.pubDate || null;

    const { data: existing } = await supabase
      .from('episodes')
      .select('id')
      .eq('podcast_id', podcast.id)
      .eq('guid', guid)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('episodes')
        .update({
          title,
          description,
          audio_url: audioUrl,
          published_at: publishedAt,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('episodes').insert({
        podcast_id: podcast.id,
        guid,
        title,
        description,
        audio_url: audioUrl,
        published_at: publishedAt,
      });
    }
  }
}
