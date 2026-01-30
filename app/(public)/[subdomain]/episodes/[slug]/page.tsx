// app/(public)/[subdomain]/episodes/[slug]/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';

type PageProps = {
  params: Promise<{ subdomain: string; slug: string }>;
};

export default async function EpisodePage({ params }: PageProps) {
  const { subdomain, slug } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: podcast } = await supabase
    .from('podcasts')
    .select('id, title')
    .eq('id', subdomain)
    .maybeSingle();

  if (!podcast) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-slate-300">Podcast not found.</p>
        <p className="mt-2 text-xs">
          <Link href="/" className="text-sky-400 hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    );
  }

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

  const hasYouTube = Boolean(episode.youtube_video_id);
  const hasAudio = Boolean(episode.audio_url);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
          {podcast.title}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-50">
          {episode.title}
        </h1>
        {episode.published_at && (
          <p className="mt-1 text-xs text-slate-500">
            {new Date(episode.published_at).toLocaleDateString()}
          </p>
        )}
      </header>

      {hasYouTube && (
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-800 bg-black">
          <div className="aspect-video w-full">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${episode.youtube_video_id}`}
              title={episode.title || 'Episode video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {hasAudio && (
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Listen to this episode
          </p>
          <audio controls src={episode.audio_url} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {episode.description && (
        <section className="prose prose-invert max-w-none text-sm">
          <div dangerouslySetInnerHTML={{ __html: episode.description }} />
        </section>
      )}

      <p className="mt-6 text-xs">
        <Link href={`/${subdomain}`} className="text-sky-400 hover:underline">
          ← Back to show
        </Link>
      </p>
    </main>
  );
}
