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

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subdomain);

  // Debug log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Episodes page - Looking for podcast with subdomain:', subdomain, 'isUuid:', isUuid);
  }

  let podcast: { id: string; [k: string]: unknown } | null = null;
  let podcastError: unknown = null;
  
  if (isUuid) {
    // First try by ID (UUID)
    const byId = await supabase.from('podcasts').select('*').eq('id', subdomain).maybeSingle();
    if (process.env.NODE_ENV === 'development') {
      console.log('Episodes page - Query by ID result:', byId);
    }
    podcast = byId.data;
    podcastError = byId.error;
    
    // Fallback to custom_domain
    if (!podcast) {
      const byDomain = await supabase.from('podcasts').select('*').eq('custom_domain', subdomain).maybeSingle();
      if (process.env.NODE_ENV === 'development') {
        console.log('Episodes page - Query by custom_domain result:', byDomain);
      }
      podcast = byDomain.data;
      podcastError = byDomain.error;
    }
  } else {
    // Try by custom_domain first
    const byDomain = await supabase.from('podcasts').select('*').eq('custom_domain', subdomain).maybeSingle();
    if (process.env.NODE_ENV === 'development') {
      console.log('Episodes page - Query by custom_domain:', byDomain);
    }
    podcast = byDomain.data;
    podcastError = byDomain.error;
    
    // Fallback to ID
    if (!podcast) {
      const byId = await supabase.from('podcasts').select('*').eq('id', subdomain).maybeSingle();
      if (process.env.NODE_ENV === 'development') {
        console.log('Episodes page - Fallback query by ID:', byId);
      }
      podcast = byId.data;
      podcastError = byId.error;
    }
  }

  // If demo podcast and not found, use demo data
  const isDemoPodcast = subdomain === 'fe816460-cbe9-49eb-949e-b943e0086328';
  
  if (isDemoPodcast && !podcast) {
    console.log('Using demo podcast data for episodes page:', subdomain);
    podcast = {
      id: 'fe816460-cbe9-49eb-949e-b943e0086328',
      title: 'The Tech Explorer',
      description: 'Exploring the latest in technology, startups, and innovation.',
      rss_url: 'https://anchor.fm/s/abc123/podcast/rss',
      youtube_channel_id: null,
      theme_config: {
        primaryColor: '#6366f1',
        backgroundColor: '#0f172a',
        foregroundColor: '#f8fafc',
        accentColor: '#8b5cf6',
        borderColor: '#334155',
        fontHeading: "'Inter', sans-serif",
        fontBody: "'Inter', sans-serif",
        cornerRadius: '8px',
        layout: 'netflix',
        imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=800&fit=crop',
      },
      page_layout: ['hero', 'shorts', 'subscribe', 'grid', 'host'],
    } as any;
  }

  if (podcastError) {
    console.error('Episodes page - Podcast query error:', podcastError);
  }

  if (podcastError || !podcast) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p>Podcast not found.</p>
      </main>
    );
  }

  let query = supabase
    .from('episodes')
    .select('id, slug, title, published_at, image_url, description, audio_url')
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
  const podcastWithImage = {
    id: podcast.id,
    title: (podcast.title as string) ?? '',
    tagline: (podcast.tagline as string | undefined),
    description: (podcast.description as string | undefined),
    image: themeConfig.imageUrl,
  };
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
              <Link href={`/${subdomain}/episodes`} className="mt-4 inline-block text-primary font-black uppercase tracking-tighter hover:underline">
                View all episodes
              </Link>
            </div>
          )}
        </div>
      </LayoutComponent>
    </>
  );
}
