// app/(public)/[subdomain]/episodes/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import ThemeEngine, { ThemeConfig } from '@/components/ThemeEngine';
import NetflixLayout from '@/components/layouts/NetflixLayout';
import SubstackLayout from '@/components/layouts/SubstackLayout';
import GenZLayout from '@/components/layouts/GenZLayout';
import GridBlock from '@/components/blocks/GridBlock';

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
        <div className="mx-auto max-w-7xl px-4 py-20">
          <header className="mb-16">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase md:text-6xl leading-none">
              {q ? `Searching for "${q}"` : 'All Episodes'}
            </h1>
            <p className="mt-4 text-zinc-500 font-medium tracking-widest uppercase text-sm">
              Showing {episodes?.length || 0} episodes
            </p>
          </header>

          <GridBlock podcast={podcastWithImage} episodes={episodes || []} />

          {!episodes?.length && (
            <div className="py-20 text-center border-4 border-dashed border-zinc-100 rounded-sm">
              <p className="text-zinc-500 font-bold italic">No episodes found matching your search.</p>
              <Link href={`/${subdomain}/episodes`} className="mt-4 inline-block text-red-600 font-black uppercase tracking-tighter hover:underline">
                View all episodes
              </Link>
            </div>
          )}
        </div>
      </LayoutComponent>
    </>
  );
}
