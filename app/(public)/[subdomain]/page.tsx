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
import DigitalProductBlock from '@/components/blocks/DigitalProductBlock';
import LivePodcastManager from '@/components/public/LivePodcastManager';
import SubscribeModal from '@/components/public/SubscribeModal';
import PodcastPageWrapper from '@/components/public/PodcastPageWrapper';

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
  return <PodcastHomeClient params={params} searchParams={searchParams} />;
}

async function PodcastHomeClient({ params, searchParams }: PageProps) {
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
    const byId = await supabase.from('podcasts').select('*').eq('id', subdomain).maybeSingle();
    podcast = byId.data;
    podcastError = byId.error;
    
    // If not found by ID, try to find by custom_domain
    if (!podcast) {
      const byDomain = await supabase.from('podcasts').select('*').eq('custom_domain', subdomain).maybeSingle();
      podcast = byDomain.data;
      podcastError = byDomain.error;
    }
  } else {
    // If not a UUID, try by custom_domain
    const byDomain = await supabase.from('podcasts').select('*').eq('custom_domain', subdomain).maybeSingle();
    podcast = byDomain.data;
    podcastError = byDomain.error;
    
    // If still not found, try to find by ID
    if (!podcast) {
      const byId = await supabase.from('podcasts').select('*').eq('id', subdomain).maybeSingle();
      podcast = byId.data;
      podcastError = byId.error;
    }
  }

  // Separate query for products and shorts to avoid join failures
  let products: any[] = [];
  let shorts: any[] = [];
  if (podcast) {
    const { data: productsData } = await supabase.from('products').select('*').eq('podcast_id', podcast.id);
    products = productsData || [];

    const { data: shortsData } = await supabase.from('shorts').select('*').eq('podcast_id', podcast.id).order('published_at', { ascending: false }).limit(10);
    shorts = shortsData || [];

    // If no shorts found but we have a channel ID, try a one-time fetch and sync
    if (shorts.length === 0 && podcast.youtube_channel_id) {
       try {
         const { fetchShorts } = await import('@/lib/youtube/shorts');
         const fetchedShorts = await fetchShorts(podcast.youtube_channel_id as string);
         if (fetchedShorts.length > 0) {
            // Background sync (not blocking for this request would be better, but for "functioning well" on first load we can do a quick insert)
            const shortsToSave = fetchedShorts.map((s: any) => ({ ...s, podcast_id: podcast!.id }));
            const { data: savedShorts } = await supabase.from('shorts').insert(shortsToSave).select();
            shorts = savedShorts || fetchedShorts;
         }
       } catch (e) {
         console.warn('Failed to auto-sync shorts on first load:', e);
       }
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

  // Filter out pending/rejected youtube videos
  const safeEpisodes = (episodes || []).map((ep: any) => ({
    ...ep,
    youtube_video_id: (ep.video_sync_status === 'pending' || ep.video_sync_status === 'rejected' || !ep.youtube_video_id) ? null : ep.youtube_video_id
  }));

  let finalEpisodes = safeEpisodes;
  if (isDemoPodcast && (!safeEpisodes || safeEpisodes.length === 0)) {
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

  const defaultLayout = ['hero', 'subscribe', 'product', 'grid', 'host', 'shorts'];
  const rawLayout = (podcast.page_layout as string[]) || defaultLayout;
  const hiddenBlocks = themeConfig.hiddenBlocks || [];

  // Filter out hidden blocks
  let pageLayout = rawLayout.filter(block => !hiddenBlocks.includes(block));

  // Auto-inject product block if products exist but it's not in layout
  if (products.length > 0 && !pageLayout.includes('product') && !hiddenBlocks.includes('product')) {
    const subscribeIndex = pageLayout.indexOf('subscribe');
    if (subscribeIndex !== -1) {
      pageLayout.splice(subscribeIndex + 1, 0, 'product');
    } else {
      pageLayout.push('product');
    }
  }

  // Create a properly typed podcast object for the Layout
  const layoutPodcast = {
    ...podcastWithImage,
    title: podcastWithImage.title,
    tagline: themeConfig.tagline,
    latest_video_id: latest?.youtube_video_id
  };

    // Create dictionary of blocks for LiveLayoutController
    const blockDict: Record<string, React.ReactNode> = {
        hero: <HeroBlock podcast={podcastWithImage} latestEpisode={latest} />,
        shorts: <ShortsBlock shorts={shorts} podcast={podcastWithImage} />,
        grid: (
            <div className="space-y-12">
                <GridBlock podcast={podcastWithImage} episodes={finalEpisodes || []} />
                {finalEpisodes.length >= PAGE_SIZE && (
                    <div className="flex justify-center pb-20">
                        <Link
                            href={`/${subdomain}/episodes`}
                            className="group relative inline-flex items-center gap-4 rounded-full border-4 border-current px-12 py-5 text-xl font-black uppercase italic tracking-tighter transition-all hover:bg-white hover:text-black hover:scale-105 active:scale-95"
                        >
                            <span>Browse All Episodes</span>
                            <span className="transition-transform group-hover:translate-x-2">→</span>
                        </Link>
                    </div>
                )}
            </div>
        ),
        episodes: <GridBlock podcast={podcastWithImage} episodes={finalEpisodes || []} />,
        subscribe: <SubscribeBlock podcast={podcastWithImage} />,
        product: products[0] ? <DigitalProductBlock product={products[0]} /> : null,
        host: <HostBlock podcast={podcastWithImage} />
    };

  return (
    <PodcastPageWrapper
      podcast={podcastWithImage}
      themeConfig={themeConfig}
      layoutComponent={LayoutComponent}
      pageLayout={pageLayout}
      blockDict={blockDict}
    />
  );
}

