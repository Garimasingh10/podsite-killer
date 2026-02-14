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
  searchParams: Promise<{ page?: string; q?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: podcast } = await supabase.from('podcasts').select('title, description').eq('id', subdomain).maybeSingle();

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

  const hasMore = episodes && episodes.length === PAGE_SIZE;
  const latest = page === 1 ? episodes?.[0] : undefined;
  const rest = page === 1 ? episodes?.slice(1) ?? [] : episodes ?? [];

  const themeConfig = (podcast.theme_config as unknown as ThemeConfig) || {};
  const podcastWithImage = {
    ...podcast,
    image: themeConfig.imageUrl,
    latest_video_id: latest?.youtube_video_id
  };
  const layout = themeConfig.layout || 'netflix';

  const defaultLayout = ['hero', 'shorts', 'subscribe', 'grid', 'host'];
  const pageLayout = (podcast.page_layout as string[]) || defaultLayout;

  return (
    <>
      <ThemeEngine config={themeConfig} />
      <LayoutComponent podcast={{ ...podcastWithImage, latest_video_id: latest?.youtube_video_id }}>
        <div className="flex flex-col">
          {pageLayout.map((blockType) => {
            switch (blockType) {
              case 'hero':
                return <HeroBlock key="hero" podcast={podcastWithImage} latestEpisode={latest} />;
              case 'shorts':
                return <ShortsBlock key="shorts" podcast={podcastWithImage} />;
              case 'grid':
                return <GridBlock key="grid" podcast={podcastWithImage} episodes={episodes || []} />;
              case 'subscribe':
                return <SubscribeBlock key="subscribe" podcast={podcastWithImage} />;
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
