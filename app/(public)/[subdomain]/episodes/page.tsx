// app/(public)/[subdomain]/episodes/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';

type EpisodesIndexProps = {
  params: Promise<{ subdomain: string }>;
};

type EpisodeRow = {
  id: string;
  slug: string | null;
  title: string | null;
  published_at: string | null;
};

export default async function EpisodesIndex({ params }: EpisodesIndexProps) {
  const { subdomain } = await params;

  const supabase = createSupabaseServerClient();

  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .select('id, title')
    .eq('id', subdomain)
    .maybeSingle();

  if (podcastError || !podcast) {
    console.error('episodes index podcastError', podcastError);
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p>Podcast not found.</p>
      </main>
    );
  }

  const { data: episodesRaw, error: episodesError } = await supabase
    .from('episodes')
    .select('id, slug, title, published_at')
    .eq('podcast_id', podcast.id)
    .order('published_at', { ascending: false });

  if (episodesError) {
    console.error('episodes index error', episodesError);
  }

  const episodes: EpisodeRow[] = (episodesRaw as EpisodeRow[]) ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-50">
          {podcast.title}
        </h1>
        <p className="mt-1 text-xs text-slate-400">All episodes</p>
      </header>

      {!episodes.length ? (
        <p className="text-sm text-slate-500">No episodes yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {episodes.map((ep) => (
            <li key={ep.id}>
              {ep.slug ? (
                <Link
                  href={`/${subdomain}/episodes/${ep.slug}`}
                  className="text-sky-400 hover:underline"
                >
                  {ep.title || ep.slug}
                </Link>
              ) : (
                <span className="text-sky-400">
                  {ep.title || '(no slug)'}
                </span>
              )}
              {ep.published_at && (
                <span className="ml-2 text-[11px] text-slate-500">
                  {new Date(ep.published_at).toLocaleDateString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
