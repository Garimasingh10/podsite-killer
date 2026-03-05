import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import ThemeEngine, { ThemeConfig } from '@/components/ThemeEngine';
import EpisodePlayer from '@/components/EpisodePlayer';
import NetflixLayout from '@/components/layouts/NetflixLayout';
import SubstackLayout from '@/components/layouts/SubstackLayout';
import GenZLayout from '@/components/layouts/GenZLayout';

// Helper to detect if we should show fallback
function isMainAppHost(host: string | null) {
  if (!host) return false;
  const rootDomain = host.split(':')[0].toLowerCase();
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN?.split(':')[0]?.toLowerCase();

  return (
    rootDomain === 'localhost' ||
    rootDomain === '127.0.0.1' ||
    rootDomain === '[::1]' ||
    rootDomain === appDomain ||
    rootDomain === 'app.podsitekiller.com' ||
    rootDomain.includes('vercel.app') ||
    rootDomain.includes('makemypodcastsite.com')
  );
}

type PageProps = {
  params: Promise<{ subdomain: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const headerList = await headers();
  const host = headerList.get('host');

  const supabase = await createSupabaseServerClient();

  // First, resolve the podcast to get the correct UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subdomain);
  const { data: dbPodcast } = await supabase
    .from('podcasts')
    .select('id, title, description')
    .or(isUuid ? `id.eq.${subdomain},custom_domain.eq.${subdomain}` : `custom_domain.eq.${subdomain}`)
    .maybeSingle();

  let podcast = dbPodcast;

  // Fallback Metadata for Ready Set Do
  const isExplicitRoot =
    subdomain.toLowerCase() === 'makemypodcastsite.com' ||
    subdomain.toLowerCase() === 'localhost' ||
    subdomain.toLowerCase() === '127.0.0.1';

  if (!podcast && isExplicitRoot && isMainAppHost(host)) {
    podcast = {
      id: 'default-podcast-id',
      title: 'Ready Set Do',
      description: 'The ultimate podcast show for creators.'
    } as any;
  }

  if (!podcast) return { title: 'Podcast Not Found' };

  const { data: dbEpisode } = await supabase
    .from('episodes')
    .select('title, description')
    .eq('podcast_id', podcast.id)
    .eq('slug', slug)
    .maybeSingle();

  let episode = dbEpisode;

  if (!episode && podcast.id === 'default-podcast-id') {
    if (slug === 'future-of-ai-agents') {
      episode = { title: 'The Future of AI Agents', description: 'AI agents deep dive.' };
    } else if (slug === 'building-premium-web-apps') {
      episode = { title: 'Building Premium Web Apps', description: 'Modern engineering principles.' };
    }
  }

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
  const headerList = await headers();
  const host = headerList.get('host');

  const supabase = await createSupabaseServerClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subdomain);
  const { data: podcast, error: dbError } = await supabase
    .from('podcasts')
    .select('*')
    .or(isUuid ? `id.eq.${subdomain},custom_domain.eq.${subdomain}` : `custom_domain.eq.${subdomain}`)
    .maybeSingle();

  let resolvedPodcast = podcast;
  let podcastError = dbError;

  // Selective Fallback for Episode Page
  const isExplicitRoot =
    subdomain.toLowerCase() === 'makemypodcastsite.com' ||
    subdomain.toLowerCase() === 'localhost' ||
    subdomain.toLowerCase() === '127.0.0.1';

  if ((!resolvedPodcast || podcastError) && isExplicitRoot && isMainAppHost(host)) {
    console.log('>>> PodSite Killer: Activating PREMIUM FALLBACK for Episode root host:', host);
    resolvedPodcast = {
      id: 'default-podcast-id',
      title: 'Ready Set Do',
      theme_config: {
        primaryColor: '#6366f1',
        accentColor: '#8b5cf6',
        imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600&auto=format&fit=crop&q=80',
        layout: 'netflix'
      }
    } as any;
    podcastError = null;
  }

  if (podcastError || !resolvedPodcast) {
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
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            Powered by PodSite Killer
          </p>
        </div>
      </main>
    );
  }

  const themeConfig = (resolvedPodcast.theme_config as unknown as ThemeConfig) || {};
  const podcastWithImage = { ...resolvedPodcast, image: themeConfig.imageUrl };
  const layout = themeConfig.layout || 'netflix';

  const LayoutComponent =
    layout === 'substack' ? SubstackLayout :
      layout === 'genz' ? GenZLayout :
        NetflixLayout;

  const { data: dbEpisode } = await supabase
    .from('episodes')
    .select(
      'id, title, published_at, audio_url, youtube_video_id, description',
    )
    .eq('podcast_id', resolvedPodcast.id)
    .eq('slug', slug)
    .maybeSingle();

  let episode = dbEpisode;

  // Fallback Episodes for Ready Set Do
  if (!episode && resolvedPodcast.id === 'default-podcast-id') {
    if (slug === 'future-of-ai-agents') {
      episode = {
        id: 'ep1',
        title: 'The Future of AI Agents',
        published_at: new Date().toISOString(),
        audio_url: 'https://cdn.simplecast.com/audio/2be2a2/2be2a246-34a9-44d4-8395-6b5cf166f287/9a3c9b7e-953b-4f9e-9d2a-89a6c9cf1c2c/the-sunday-read-the-most-famous-people-on-earth_tc.mp3',
        description: 'Exploring how AI agents will reshape the workplace and creative landscape.'
      };
    } else if (slug === 'building-premium-web-apps') {
      episode = {
        id: 'ep2',
        title: 'Building Premium Web Apps',
        published_at: new Date().toISOString(),
        audio_url: 'https://cdn.simplecast.com/audio/2be2a2/2be2a246-34a9-44d4-8395-6b5cf166f287/9a3c9b7e-953b-4f9e-9d2a-89a6c9cf1c2c/the-sunday-read-the-most-famous-people-on-earth_tc.mp3',
        description: 'A deep dive into the engineering principles of modern, high-end web applications.'
      };
    }
  }

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
              className="group mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:opacity-80 transition-all"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              Back to {resolvedPodcast.title}
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
            layout === 'genz' ? "border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white p-4" :
              layout === 'substack' ? "border border-zinc-100 bg-white" :
                ""
          }>
            <EpisodePlayer
              podcastId={resolvedPodcast.id}
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
              className="group inline-flex items-center gap-4 text-2xl font-black italic uppercase tracking-tighter text-current transition-all hover:text-primary"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-current transition-transform group-hover:-translate-x-3">←</span>
              <span>Keep Exploring {resolvedPodcast.title}</span>
            </Link>
          </div>
        </div>
      </LayoutComponent>
    </>
  );
}
