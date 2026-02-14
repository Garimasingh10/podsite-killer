// app/(public)/[subdomain]/episodes/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import ThemeEngine, { ThemeConfig } from '@/components/ThemeEngine';
import NetflixLayout from '@/components/layouts/NetflixLayout';
import SubstackLayout from '@/components/layouts/SubstackLayout';
import GenZLayout from '@/components/layouts/GenZLayout';

type EpisodesIndexProps = {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function EpisodesIndex({ params, searchParams }: EpisodesIndexProps) {
  const { subdomain } = await params;
  const { q } = await searchParams;

  const supabase = await createSupabaseServerClient();

  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .select('*')
    .eq('id', subdomain)
    .maybeSingle();

  if (podcastError || !podcast) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p>Podcast not found.</p>
      </main>
    );
  }

  let query = supabase
    .from('episodes')
    .select('id, slug, title, published_at, image_url')
    .eq('podcast_id', podcast.id)
    .order('published_at', { ascending: false });

  if (q) {
    query = query.ilike('title', `%${q}%`);
  }

  const { data: episodes, error: episodesError } = await query;

  if (episodesError) {
    console.error('episodes index error', episodesError);
  }

  const themeConfig = (podcast.theme_config as unknown as ThemeConfig) || {};
  const podcastWithImage = { ...podcast, image: themeConfig.imageUrl };
  const layout = themeConfig.layout || 'netflix';

  const LayoutComponent =
    layout === 'substack' ? SubstackLayout :
      layout === 'genz' ? GenZLayout :
        NetflixLayout;

  return (
    <>
      <ThemeEngine config={themeConfig} />
      <LayoutComponent podcast={podcastWithImage}>
        <div className="mx-auto max-w-4xl py-12">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">
              {q ? `Search results for "${q}"` : 'All Episodes'}
            </h1>
            <p className="mt-2 text-slate-400">
              {episodes?.length || 0} episodes found
            </p>
          </header>

          <div className="grid gap-6">
            {!episodes?.length ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-500">No episodes found matching your search.</p>
                <Link href={`/${subdomain}/episodes`} className="mt-4 inline-block text-sky-400 hover:underline">
                  View all episodes
                </Link>
              </div>
            ) : (
              episodes.map((ep) => (
                <Link
                  key={ep.id}
                  href={`/${subdomain}/episodes/${ep.slug}`}
                  className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-all"
                >
                  <div className="shrink-0">
                    <img
                      src={ep.image_url || podcastWithImage.image}
                      alt={ep.title || ''}
                      className="h-24 w-40 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                      {ep.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {ep.published_at && new Date(ep.published_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </LayoutComponent>
    </>
  );
}
