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
  const { data: podcast } = isUuid
    ? await supabase.from('podcasts').select('title, description').eq('id', subdomain).maybeSingle()
    : await supabase.from('podcasts').select('title, description').eq('custom_domain', subdomain).maybeSingle();
  const podcastFallback = !podcast && isUuid
    ? await supabase.from('podcasts').select('title, description').eq('custom_domain', subdomain).maybeSingle()
    : { data: null };
  const meta = podcast ?? podcastFallback.data;
  if (!meta) return { title: 'Podcast Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://podsite-killer.vercel.app';
  const ogUrl = new URL(`${baseUrl}/api/og/${subdomain}`);

  return {
    title: meta.title || 'Podcast',
    description: meta.description,
    openGraph: {
      title: meta.title || 'Podcast',
      description: meta.description || '',
      images: [ogUrl.toString()],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title || 'Podcast',
      description: meta.description || '',
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

  // Prefer id lookup when segment is UUID (View site from dashboard); else custom_domain
  let podcast: { id: string; [k: string]: unknown } | null = null;
  let podcastError: unknown = null;
  if (isUuid) {
    const byId = await supabase.from('podcasts').select('*, products(*)').eq('id', subdomain).maybeSingle();
    podcast = byId.data;
    podcastError = byId.error;
    if (!podcast) {
      const byDomain = await supabase.from('podcasts').select('*, products(*)').eq('custom_domain', subdomain).maybeSingle();
      podcast = byDomain.data;
      podcastError = byDomain.error;
    }
  } else {
    const byDomain = await supabase.from('podcasts').select('*, products(*)').eq('custom_domain', subdomain).maybeSingle();
    podcast = byDomain.data;
    podcastError = byDomain.error;
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
            <p className="text-slate-400 leading-relaxed">
              We couldn&apos;t find a podcast associated with <code className="bg-white/5 px-1.5 py-0.5 rounded text-primary border border-white/10">{String(subdomain)}</code>.
            </p>
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
            <Link
              href="https://podsitekiller.com"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Create Your Own
            </Link>
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

  const latest = page === 1 ? episodes?.[0] : undefined;

  const themeConfig = (podcast.theme_config as unknown as ThemeConfig) || {};
  const podcastWithImage = {
    ...podcast,
    image: themeConfig.imageUrl,
    latest_video_id: latest?.youtube_video_id
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

  return (
    <>
      <ThemeEngine config={themeConfig} />
      <LayoutComponent podcast={{
        ...podcastWithImage,
        tagline: themeConfig.tagline,
        latest_video_id: latest?.youtube_video_id
      }}>
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
