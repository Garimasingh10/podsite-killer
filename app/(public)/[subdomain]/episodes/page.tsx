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

  const supabase = await createSupabaseServerClient();

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
        <Link
          href={`/${subdomain}`}
          className="mb-2 inline-block text-xs font-medium text-sky-400 hover:underline"
        >
          ← Back to show
        </Link>
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
            <li
              key={ep.id}
              className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-800 last:border-0"
            >
              {ep.slug ? (
                <Link
                  href={`/${subdomain}/episodes/${ep.slug}`}
                  className="text-sky-400 hover:underline font-medium"
                >
                  {ep.title || ep.slug}
                </Link>
              ) : (
                <span className="text-slate-300 font-medium">
                  {ep.title || '(no slug)'}
                </span>
              )}
              {ep.published_at && (
                <span className="text-xs text-slate-500 shrink-0">
                  {new Date(ep.published_at).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
