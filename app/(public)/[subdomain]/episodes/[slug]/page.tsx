import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { Metadata } from 'next';
import ThemeEngine, { ThemeConfig } from '@/components/ThemeEngine';
import EpisodePlayer from '@/components/EpisodePlayer';
import NetflixLayout from '@/components/layouts/NetflixLayout';
import SubstackLayout from '@/components/layouts/SubstackLayout';
import GenZLayout from '@/components/layouts/GenZLayout';

type PageProps = {
  params: Promise<{ subdomain: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: episode } = await supabase
    .from('episodes')
    .select('title, description')
    .eq('podcast_id', subdomain)
    .eq('slug', slug)
    .maybeSingle();

  if (!episode) return { title: 'Episode Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://podsite-killer.vercel.app';
  const ogUrl = new URL(`${baseUrl}/api/og/${subdomain}`);
  ogUrl.searchParams.set('title', episode.title || '');

  return {
    title: episode.title || 'Episode',
    description: episode.description?.replace(/<[^>]*>/g, '').slice(0, 160),
    openGraph: {
      title: episode.title || 'Episode',
      description: episode.description?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
      images: [ogUrl.toString()],
    },
    twitter: {
      card: 'summary_large_image',
      title: episode.title || 'Episode',
      description: episode.description?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
      images: [ogUrl.toString()],
    },
  };
}

export default async function EpisodePage({ params }: PageProps) {
  const { subdomain, slug } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: podcast } = await supabase
    .from('podcasts')
    .select('*')
    .eq('id', subdomain)
    .maybeSingle();

  if (!podcast) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-slate-300">Podcast not found.</p>
        <p className="mt-2 text-xs">
          <Link href="/" className="text-primary hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    );
  }

  const themeConfig = (podcast.theme_config as unknown as ThemeConfig) || {};
  const podcastWithImage = { ...podcast, image: themeConfig.imageUrl };
  const layout = themeConfig.layout || 'netflix';

  const LayoutComponent =
    layout === 'substack' ? SubstackLayout :
      layout === 'genz' ? GenZLayout :
        NetflixLayout;

  const { data: episode } = await supabase
    .from('episodes')
    .select(
      'id, title, published_at, audio_url, youtube_video_id, description',
    )
    .eq('podcast_id', podcast.id)
    .eq('slug', slug)
    .maybeSingle();

  if (!episode) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-slate-300">Episode not found.</p>
        <p className="mt-2 text-xs">
          <Link href={`/${subdomain}`} className="text-sky-400 hover:underline">
            ← Back to show
          </Link>
        </p>
      </main>
    );
  }

  return (
    <>
      <ThemeEngine config={themeConfig} />
      <LayoutComponent podcast={podcastWithImage}>
        <div className="mx-auto max-w-5xl py-20 px-4">
          <header className="mb-16">
            <Link
              href={`/${subdomain}`}
              className="group mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-red-600 hover:opacity-80 transition-all"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              Back to {podcast.title}
            </Link>
            <h1 className="mt-6 text-5xl font-black italic tracking-tighter md:text-8xl leading-[0.85] uppercase">
              {episode.title}
            </h1>
            <div className="mt-8 flex items-center gap-6">
              {episode.published_at && (
                <p className="text-sm font-black uppercase tracking-widest text-zinc-500">
                  {new Date(episode.published_at).toLocaleDateString(undefined, {
                    dateStyle: 'long'
                  })}
                </p>
              )}
              <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Official Release
              </p>
            </div>
          </header>

          <div className={
            layout === 'genz' ? "border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white p-4" :
              layout === 'substack' ? "border border-zinc-100 bg-white" :
                ""
          }>
            <EpisodePlayer
              podcastId={subdomain}
              youtubeVideoId={episode.youtube_video_id}
              audioUrl={episode.audio_url}
              title={episode.title || 'Untitled'}
              description={episode.description || ''}
              primaryColor={themeConfig.primaryColor}
              accentColor={themeConfig.accentColor}
            />
          </div>

          <div className="mt-32 pt-16 border-t border-zinc-100/10">
            <Link
              href={`/${subdomain}`}
              className="group inline-flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter text-current transition-all hover:text-red-600"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-current transition-transform group-hover:-translate-x-3">←</span>
              <span>Keep Exploring {podcast.title}</span>
            </Link>
          </div>
        </div>
      </LayoutComponent>
    </>
  );
}
