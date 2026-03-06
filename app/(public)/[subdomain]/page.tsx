import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import ThemeEngine, { ThemeConfig } from '@/components/ThemeEngine';
import NetflixLayout from '@/components/layouts/NetflixLayout';
import SubstackLayout from '@/components/layouts/SubstackLayout';
import GenZLayout from '@/components/layouts/GenZLayout';
import HeroBlock from '@/components/blocks/HeroBlock';
import GridBlock from '@/components/blocks/GridBlock';
import SubscribeBlock from '@/components/blocks/SubscribeBlock';
import HostBlock from '@/components/blocks/HostBlock';
import ShortsBlock from '@/components/blocks/ShortsBlock';
import ProductBlock from '@/components/blocks/ProductBlock';

const PAGE_SIZE = 20;

// NOTE: params & searchParams are Promises here
type PageProps = {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const supabase = await createSupabaseServerClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subdomain);
  
  let podcast;
  let podcastError;
  
  if (isUuid) {
    // First try by ID
    const byId = await supabase.from('podcasts').select('title, description').eq('id', subdomain).maybeSingle();
    podcast = byId.data;
    podcastError = byId.error;
    
    // Fallback to custom_domain
    if (!podcast) {
      const byDomain = await supabase.from('podcasts').select('title, description').eq('custom_domain', subdomain).maybeSingle();
      podcast = byDomain.data;
      podcastError = byDomain.error;
    }
  } else {
    // Try by custom_domain first
    const byDomain = await supabase.from('podcasts').select('title, description').eq('custom_domain', subdomain).maybeSingle();
    podcast = byDomain.data;
    podcastError = byDomain.error;
    
    // Fallback to ID
    if (!podcast) {
      const byId = await supabase.from('podcasts').select('title, description').eq('id', subdomain).maybeSingle();
      podcast = byId.data;
      podcastError = byId.error;
    }
  }
  
  if (podcastError) {
    console.error('generateMetadata - Podcast query error:', podcastError);
  }
  
  if (!podcast) return { title: 'Podcast Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://podsite-killer.vercel.app';
  const ogUrl = new URL(`${baseUrl}/api/og/${subdomain}`);

  return {
    title: podcast.title || 'Podcast',
    description: podcast.description,
    openGraph: {
      title: podcast.title || 'Podcast',
      description: podcast.description || '',
      images: [ogUrl.toString()],
    },
    twitter: {
      card: 'summary_large_image',
      title: podcast.title || 'Podcast',
      description: podcast.description || '',
      images: [ogUrl.toString()],
    },
  };
}

export default async function PodcastHome({ params, searchParams }: PageProps) {
  const { subdomain } = await params;
  const { page: pageParam, q: qParam } = await searchParams;
  const q = qParam?.trim();

  const page = Number(pageParam ?? '1') || 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createSupabaseServerClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subdomain);

  // Debug log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Looking for podcast with subdomain:', subdomain, 'isUuid:', isUuid);
  }

  // FALLBACK: Demo podcast for fe816460-cbe9-49eb-949e-b943e0086328 if not found
  const isDemoPodcast = subdomain === 'fe816460-cbe9-49eb-949e-b943e0086328';

  // Prefer id lookup when segment is UUID (View site from dashboard); else custom_domain
  let podcast: { id: string; [k: string]: unknown } | null = null;
  let podcastError: unknown = null;
  
  if (isUuid) {
    // First try to find by ID (UUID)
    const byId = await supabase.from('podcasts').select('*, products(*)').eq('id', subdomain).maybeSingle();
    if (process.env.NODE_ENV === 'development') {
      console.log('Query by ID result:', byId);
    }
    podcast = byId.data;
    podcastError = byId.error;
    
    // If not found by ID, try to find by custom_domain
    if (!podcast) {
      const byDomain = await supabase.from('podcasts').select('*, products(*)').eq('custom_domain', subdomain).maybeSingle();
      if (process.env.NODE_ENV === 'development') {
        console.log('Query by custom_domain result:', byDomain);
      }
      podcast = byDomain.data;
      podcastError = byDomain.error;
    }
  } else {
    // If not a UUID, try by custom_domain
    const byDomain = await supabase.from('podcasts').select('*, products(*)').eq('custom_domain', subdomain).maybeSingle();
    if (process.env.NODE_ENV === 'development') {
      console.log('Query by custom_domain (non-UUID):', byDomain);
    }
    podcast = byDomain.data;
    podcastError = byDomain.error;
    
    // If still not found, try to find by ID (in case the subdomain looks like a domain but is actually a UUID)
    if (!podcast) {
      const byId = await supabase.from('podcasts').select('*, products(*)').eq('id', subdomain).maybeSingle();
      if (process.env.NODE_ENV === 'development') {
        console.log('Fallback query by ID:', byId);
      }
      podcast = byId.data;
      podcastError = byId.error;
    }
  }

  // If demo podcast and not found, use demo data
  if (isDemoPodcast && !podcast) {
    console.log('Using demo podcast data for:', subdomain);
    podcast = {
      id: 'fe816460-cbe9-49eb-949e-b943e0086328',
      title: 'The Tech Explorer',
      description: 'Exploring the latest in technology, startups, and innovation. Join us on a journey through the digital frontier.',
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

  if (podcastError || !podcast) {
    console.error('Podcast query error:', {
      subdomain,
      isUuid,
      error: podcastError,
      found: !!podcast,
    });
  }

  if (podcastError || !podcast) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 font-sans selection:bg-primary/30">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-2xl rounded-full opacity-50 animate-pulse" />
            <h1 className="relative text-7xl font-black text-white tracking-tighter">404</h1>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Podcast not found</h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              We couldn't find a podcast associated with:
              <code className="block bg-white/5 px-3 py-2 rounded text-primary border border-white/10 mt-3 break-all font-mono text-xs">{String(subdomain)}</code>
            </p>
            <p className="text-slate-500 text-xs mt-4">
              This could be because the podcast hasn't been created yet, or the incorrect URL was used. Check that you've imported the podcast in your dashboard first.
            </p>
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
            <a
              href="https://podsitekiller.com"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Create Your Own
            </a>
            <a
              href="/login"
              className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </main>
    );
  }

  let episodesQuery = supabase
    .from('episodes')
    .select('id, title, slug, published_at, image_url, youtube_video_id')
    .eq('podcast_id', podcast.id)
    .order('published_at', { ascending: false });

  if (q) {
    episodesQuery = episodesQuery.ilike('title', `%${q}%`);
  }

  const { data: episodes, error: episodesError } = await episodesQuery.range(from, to);

  if (episodesError) {
    console.error('episodesError', episodesError);
  }

  // For demo podcast, provide sample episodes if none in DB
  let finalEpisodes = episodes;
  if (isDemoPodcast && (!episodes || episodes.length === 0)) {
    finalEpisodes = [
      {
        id: 'demo-1',
        title: 'The Future of AI: What to Expect in 2025',
        slug: 'the-future-of-ai-what-to-expect-in-2025',
        published_at: '2025-01-15T10:00:00Z',
        image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop',
        youtube_video_id: null,
      },
      {
        id: 'demo-2',
        title: 'Building a Startup: From Zero to Hero',
        slug: 'building-a-startup-from-zero-to-hero',
        published_at: '2025-01-08T10:00:00Z',
        image_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=800&fit=crop',
        youtube_video_id: null,
      },
      {
        id: 'demo-3',
        title: 'The Rise of Remote Work Culture',
        slug: 'the-rise-of-remote-work-culture',
        published_at: '2025-01-01T10:00:00Z',
        image_url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=800&fit=crop',
        youtube_video_id: null,
      },
    ];
  }

  const latest = page === 1 ? finalEpisodes?.[0] : undefined;

  const themeConfig = (podcast.theme_config as unknown as ThemeConfig) || {};
  const podcastWithImage = {
    ...podcast,
    image: themeConfig.imageUrl,
    latest_video_id: latest?.youtube_video_id,
    title: podcast.title as string // Ensure title is explicitly passed
  };
  const layout = themeConfig.layout || 'netflix';

  const LayoutComponent =
    layout === 'substack' ? SubstackLayout :
      layout === 'genz' ? GenZLayout :
        NetflixLayout;

  const defaultLayout = ['hero', 'shorts', 'subscribe', 'grid', 'host'];
  const rawLayout = (podcast.page_layout as string[]) || defaultLayout;
  const hiddenBlocks = themeConfig.hiddenBlocks || [];

  // Filter out hidden blocks
  const pageLayout = rawLayout.filter(block => !hiddenBlocks.includes(block));

  // Create a properly typed podcast object for the Layout
  const layoutPodcast = {
    ...podcastWithImage,
    title: podcastWithImage.title,
    tagline: themeConfig.tagline,
    latest_video_id: latest?.youtube_video_id
  };

  return (
    <>
      <ThemeEngine config={themeConfig} />
      <LayoutComponent podcast={layoutPodcast}>
        <div className="flex flex-col">
          {pageLayout.map((blockType) => {
            switch (blockType) {
              case 'hero':
                return <HeroBlock key="hero" podcast={podcastWithImage} latestEpisode={latest} />;
              case 'shorts':
                return <ShortsBlock key="shorts" podcast={podcastWithImage} />;
              case 'grid':
              case 'episodes':
                return <GridBlock key="grid" podcast={podcastWithImage} episodes={episodes || []} />;
              case 'subscribe':
                return <SubscribeBlock key="subscribe" podcast={podcastWithImage} />;
              case 'product':
                // Check if products exist in the data (we are not joining products currently to avoid schema errors)
                return (podcast as any).products?.[0] ? <ProductBlock key="product" product={(podcast as any).products[0]} /> : null;
              case 'host':
                return <HostBlock key="host" podcast={podcastWithImage} />;
              default:
                return null;
            }
          })}
        </div>
      </LayoutComponent>
    </>
  );
}
