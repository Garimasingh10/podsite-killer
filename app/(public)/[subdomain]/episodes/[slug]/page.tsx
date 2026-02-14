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

  const ogUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/og/${subdomain}`);
  ogUrl.searchParams.set('title', episode.title || '');

  return {
    title: episode.title,
    description: episode.description?.replace(/<[^>]*>/g, '').slice(0, 160),
    openGraph: {
      title: episode.title,
      description: episode.description?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
      images: [ogUrl.toString()],
    },
    twitter: {
      card: 'summary_large_image',
      title: episode.title,
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
        <div className="mx-auto max-w-4xl py-12">
          <header className="mb-12">
            <Link
              href={`/${subdomain}`}
              className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-primary hover:opacity-80 transition-all font-sans"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              {podcast.title}
            </Link>
            <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl leading-[1.1] text-foreground">
              {episode.title}
            </h1>
            <div className="mt-6 flex items-center gap-4">
              {episode.published_at && (
                <p className="text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                  {new Date(episode.published_at).toLocaleDateString(undefined, {
                    dateStyle: 'long'
                  })}
                </p>
              )}
              <div className="h-1 w-1 rounded-full bg-slate-700" />
              <p className="text-xs font-bold uppercase tracking-widest text-primary/80">
                Official Site
              </p>
            </div>
          </header>

          <EpisodePlayer
            podcastId={subdomain}
            youtubeVideoId={episode.youtube_video_id}
            audioUrl={episode.audio_url}
            title={episode.title || 'Untitled'}
            description={episode.description || ''}
          />

          <div className="mt-24 pt-12 border-t border-slate-800/50">
            <Link
              href={`/${subdomain}`}
              className="group inline-flex items-center gap-3 text-lg font-black uppercase tracking-tighter text-foreground transition-all hover:text-primary"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-current transition-transform group-hover:-translate-x-2">←</span>
              <span>Keep Exploring All Episodes</span>
            </Link>
          </div>
        </div>
      </LayoutComponent>
    </>
  );
}
