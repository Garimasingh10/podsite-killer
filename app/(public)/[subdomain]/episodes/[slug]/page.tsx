import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { Metadata } from 'next';
import { headers } from 'next/headers';
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

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subdomain);
  let podcast: { id: string; title?: string; description?: string } | null = null;
  if (isUuid) {
    const byId = await supabase.from('podcasts').select('id, title, description').eq('id', subdomain).maybeSingle();
    podcast = byId.data;
    if (!podcast) {
      const byDomain = await supabase.from('podcasts').select('id, title, description').eq('custom_domain', subdomain).maybeSingle();
      podcast = byDomain.data;
    }
  } else {
    const byDomain = await supabase.from('podcasts').select('id, title, description').eq('custom_domain', subdomain).maybeSingle();
    podcast = byDomain.data;
  }
  if (!podcast) return { title: 'Podcast Not Found' };

  const { data: episode } = await supabase
    .from('episodes')
    .select('title, description')
    .eq('podcast_id', podcast.id)
    .eq('slug', slug)
    .maybeSingle();

  if (!episode) return { title: 'Episode Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://podsite-killer.vercel.app';
  const ogUrl = new URL(`${baseUrl}/api/og/${subdomain}`);
  ogUrl.searchParams.set('title', episode.title || '');

  return {
    title: `${episode.title} | ${podcast.title}`,
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

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subdomain);
  let podcast: { id: string; [k: string]: unknown } | null = null;
  let podcastError: unknown = null;
  if (isUuid) {
    const byId = await supabase.from('podcasts').select('*').eq('id', subdomain).maybeSingle();
    podcast = byId.data;
    podcastError = byId.error;
    if (!podcast) {
      const byDomain = await supabase.from('podcasts').select('*').eq('custom_domain', subdomain).maybeSingle();
      podcast = byDomain.data;
      podcastError = byDomain.error;
    }
  } else {
    const byDomain = await supabase.from('podcasts').select('*').eq('custom_domain', subdomain).maybeSingle();
    podcast = byDomain.data;
    podcastError = byDomain.error;
  }

  if (podcastError || !podcast) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 font-sans selection:bg-primary/30">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-2xl rounded-full opacity-50 animate-pulse" />
            <h1 className="relative text-7xl font-black text-white tracking-tighter uppercase italic">404</h1>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Podcast not found</h2>
            <p className="text-slate-400 leading-relaxed">
              The show <code className="bg-white/5 px-1.5 py-0.5 rounded text-primary border border-white/10">{String(subdomain)}</code> could not be found.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const themeConfig = (podcast.theme_config as unknown as ThemeConfig) || {};
  const podcastWithImage = { 
    ...podcast, 
    image: themeConfig.imageUrl,
    title: podcast.title as string // Ensure title is explicitly passed
  };
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
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 font-sans selection:bg-primary/30">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <h2 className="text-2xl font-bold text-white tracking-tight italic uppercase">Episode not found</h2>
          <p className="text-slate-400 leading-relaxed">
            The requested episode <code className="bg-white/5 px-1.5 py-0.5 rounded text-primary border border-white/10">{slug}</code> doesn&apos;t exist.
          </p>
          <Link href={`/${subdomain}`} className="inline-block px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-primary transition-all">
            Back to Show
          </Link>
        </div>
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
              className="group mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:opacity-80 transition-all font-sans"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              Back to {podcastWithImage.title}
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
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Official Release
              </p>
            </div>
          </header>

          <div className={
            layout === 'genz' ? "border-8 border-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] bg-white p-4" :
              layout === 'substack' ? "border border-zinc-100 bg-white" :
                ""
          }>
            <EpisodePlayer
              podcastId={podcast.id}
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
              className="group inline-flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter text-current transition-all hover:text-primary no-underline"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-current transition-transform group-hover:-translate-x-3 no-underline">←</span>
              <span>Keep Exploring {podcastWithImage.title}</span>
            </Link>
          </div>
        </div>
      </LayoutComponent>
    </>
  );
}
