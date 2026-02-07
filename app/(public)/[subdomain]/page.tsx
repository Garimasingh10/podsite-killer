import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { Metadata } from 'next';
import ThemeEngine, { ThemeConfig } from '@/components/ThemeEngine';
import NetflixLayout from '@/components/layouts/NetflixLayout';
import SubstackLayout from '@/components/layouts/SubstackLayout';
import GenZLayout from '@/components/layouts/GenZLayout';
import HeroBlock from '@/components/blocks/HeroBlock';
import GridBlock from '@/components/blocks/GridBlock';
import SubscribeBlock from '@/components/blocks/SubscribeBlock';
import HostBlock from '@/components/blocks/HostBlock';
import ShortsBlock from '@/components/blocks/ShortsBlock';

const PAGE_SIZE = 20;

// NOTE: params & searchParams are Promises here
type PageProps = {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: podcast } = await supabase.from('podcasts').select('title, description').eq('id', subdomain).maybeSingle();

  if (!podcast) return { title: 'Podcast Not Found' };

  const ogUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/og/${subdomain}`);

  return {
    title: podcast.title,
    description: podcast.description,
    openGraph: {
      title: podcast.title,
      description: podcast.description || '',
      images: [ogUrl.toString()],
    },
    twitter: {
      card: 'summary_large_image',
      title: podcast.title,
      description: podcast.description || '',
      images: [ogUrl.toString()],
    },
  };
}

export default async function PodcastHome({ params, searchParams }: PageProps) {
  const { subdomain } = await params;
  const { page: pageParam } = await searchParams;

  const page = Number(pageParam ?? '1') || 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createSupabaseServerClient();

  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .select('*')
    .eq('id', subdomain)
    .maybeSingle();

  if (podcastError || !podcast) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
        <h1 className="mb-2 text-3xl font-semibold">Podcast not found</h1>
        <p className="mt-2 text-sm text-slate-400">
          Could not load podcast with id <code>{String(subdomain)}</code>.
        </p>
      </main>
    );
  }

  const themeConfig = (podcast.theme_config as unknown as ThemeConfig) || {};
  const layout = themeConfig.layout || 'netflix';

  const LayoutComponent =
    layout === 'substack' ? SubstackLayout :
      layout === 'genz' ? GenZLayout :
        NetflixLayout;

  const { data: episodes, error: episodesError } = await supabase
    .from('episodes')
    .select('id, title, slug, published_at')
    .eq('podcast_id', subdomain)
    .order('published_at', { ascending: false })
    .range(from, to);

  if (episodesError) {
    console.error('episodesError', episodesError);
  }

  const hasMore = episodes && episodes.length === PAGE_SIZE;
  const latest = page === 1 ? episodes?.[0] : undefined;
  const rest = page === 1 ? episodes?.slice(1) ?? [] : episodes ?? [];

  const defaultLayout = ['hero', 'shorts', 'subscribe', 'grid', 'host'];
  const pageLayout = (podcast.page_layout as string[]) || defaultLayout;

  return (
    <>
      <ThemeEngine config={themeConfig} />
      <LayoutComponent podcast={podcast}>
        <div className="flex flex-col">
          {pageLayout.map((blockType) => {
            switch (blockType) {
              case 'hero':
                return <HeroBlock key="hero" podcast={podcast} latestEpisode={latest} />;
              case 'shorts':
                return <ShortsBlock key="shorts" podcast={podcast} />;
              case 'grid':
                return <GridBlock key="grid" podcast={podcast} episodes={episodes || []} />;
              case 'subscribe':
                return <SubscribeBlock key="subscribe" podcast={podcast} />;
              case 'host':
                return <HostBlock key="host" podcast={podcast} />;
              default:
                return null;
            }
          })}
        </div>
      </LayoutComponent>
    </>
  );
}
