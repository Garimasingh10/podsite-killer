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

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subdomain);
  let podcast: { id: string; title?: string; description?: string } | null = null;
  let podcastError: any = null;
  
  if (isUuid) {
    // First try by ID
    const byId = await supabase.from('podcasts').select('id, title, description').eq('id', subdomain).maybeSingle();
    podcast = byId.data;
    podcastError = byId.error;
    
    // Fallback to custom_domain
    if (!podcast) {
      const byDomain = await supabase.from('podcasts').select('id, title, description').eq('custom_domain', subdomain).maybeSingle();
      podcast = byDomain.data;
      podcastError = byDomain.error;
    }
  } else {
    // Try by custom_domain first
    const byDomain = await supabase.from('podcasts').select('id, title, description').eq('custom_domain', subdomain).maybeSingle();
    podcast = byDomain.data;
    podcastError = byDomain.error;
    
    // Fallback to ID
    if (!podcast) {
      const byId = await supabase.from('podcasts').select('id, title, description').eq('id', subdomain).maybeSingle();
      podcast = byId.data;
      podcastError = byId.error;
    }
  }
  
  if (podcastError) {
    console.error('Episode generateMetadata - Podcast query error:', podcastError);
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
  
  // Debug log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Episode page - Looking for podcast with subdomain:', subdomain, 'isUuid:', isUuid);
  }
  
  let podcast: { id: string; [k: string]: unknown } | null = null;
  let podcastError: unknown = null;
  
  if (isUuid) {
    // First try by ID
    const byId = await supabase.from('podcasts').select('*').eq('id', subdomain).maybeSingle();
    if (process.env.NODE_ENV === 'development') {
      console.log('Episode page - Query by ID result:', byId);
    }
    podcast = byId.data;
    podcastError = byId.error;
    
    // Fallback to custom_domain
    if (!podcast) {
      const byDomain = await supabase.from('podcasts').select('*').eq('custom_domain', subdomain).maybeSingle();
      if (process.env.NODE_ENV === 'development') {
        console.log('Episode page - Query by custom_domain result:', byDomain);
      }
      podcast = byDomain.data;
      podcastError = byDomain.error;
    }
  } else {
    // Try by custom_domain first
    const byDomain = await supabase.from('podcasts').select('*').eq('custom_domain', subdomain).maybeSingle();
    if (process.env.NODE_ENV === 'development') {
      console.log('Episode page - Query by custom_domain:', byDomain);
    }
    podcast = byDomain.data;
    podcastError = byDomain.error;
    
    // Fallback to ID
    if (!podcast) {
      const byId = await supabase.from('podcasts').select('*').eq('id', subdomain).maybeSingle();
      if (process.env.NODE_ENV === 'development') {
        console.log('Episode page - Fallback query by ID:', byId);
      }
      podcast = byId.data;
      podcastError = byId.error;
    }
  }

  // If demo podcast and not found, use demo data
  const isDemoPodcast = subdomain === 'fe816460-cbe9-49eb-949e-b943e0086328';
  
  if (isDemoPodcast && !podcast) {
    console.log('Using demo podcast data for episode page:', subdomain);
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
    console.error('Episode page - Podcast query error:', podcastError);
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

  // Demo episode data if demo podcast
  let finalEpisode = episode;
  if (isDemoPodcast && !episode) {
    // Check if it's a valid demo episode slug
    const demoEpisodes: Record<string, any> = {
      'the-future-of-ai-what-to-expect-in-2025': {
        id: 'demo-1',
        title: 'The Future of AI: What to Expect in 2025',
        published_at: '2025-01-15T10:00:00Z',
        audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        youtube_video_id: null,
        description: '<p>In this episode, we explore the cutting-edge developments in artificial intelligence and what to expect in the coming year. From large language models to AI-powered tools, we cover it all.</p>',
      },
      'building-a-startup-from-zero-to-hero': {
        id: 'demo-2',
        title: 'Building a Startup: From Zero to Hero',
        published_at: '2025-01-08T10:00:00Z',
        audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        youtube_video_id: null,
        description: '<p>Join us as we dive into the journey of building a successful startup. We share tips, strategies, and real-world examples from founders who have been there.</p>',
      },
      'the-rise-of-remote-work-culture': {
        id: 'demo-3',
        title: 'The Rise of Remote Work Culture',
        published_at: '2025-01-01T10:00:00Z',
        audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        youtube_video_id: null,
        description: '<p>Remote work is no longer a trend—it\'s a way of life. Learn how companies are adapting to this new normal and what it means for the future of work.</p>',
      },
    };
    
    if (demoEpisodes[slug]) {
      finalEpisode = demoEpisodes[slug];
    }
  }

  if (!finalEpisode) {
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
      <LayoutComponent podcast={podcastWithImage} episode={finalEpisode}>
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
              {finalEpisode.title}
            </h1>
            <div className="mt-8 flex items-center gap-6">
              {finalEpisode.published_at && (
                <p className="text-sm font-black uppercase tracking-widest text-zinc-500">
                  {new Date(finalEpisode.published_at).toLocaleDateString(undefined, {
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
              youtubeVideoId={finalEpisode.youtube_video_id}
              audioUrl={finalEpisode.audio_url}
              title={finalEpisode.title || 'Untitled'}
              description={finalEpisode.description || ''}
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

