// app/(public)/[subdomain]/episodes/[slug]/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { AudioPlayer } from '@/components/public/AudioPlayer';
import { VideoPlayer } from '@/components/public/VideoPlayer';

type EpisodePageParams = {
  subdomain: string;
  slug: string;
};

type EpisodePageProps = {
  params: Promise<EpisodePageParams>;
};

export default async function EpisodePage({ params }: EpisodePageProps) {
  // Unwrap params Promise (Next 15+)
  const { subdomain, slug } = await params;

  if (!slug || slug === 'null' || slug === 'undefined') {
    console.error('episode route: invalid slug', { subdomain, slug });
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
        <h1 className="mb-2 text-2xl font-semibold">Episode not found</h1>
        <p>podcastId: {String(subdomain)}</p>
        <p>slug is missing or invalid: {String(slug)}</p>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: episode, error: episodeError } = await supabase
    .from('episodes')
    .select('*')
    .eq('podcast_id', subdomain)
    .eq('slug', slug)
    .maybeSingle();

  if (episodeError || !episode) {
    console.error('episodeError', episodeError);
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
        <h1 className="mb-2 text-2xl font-semibold">Episode not found</h1>
        <p>podcastId: {String(subdomain)}</p>
        <p>slug: {slug}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
      <h1 className="mb-4 text-2xl font-semibold">
        {episode.title || slug}
      </h1>

      {/* Prefer video if present, otherwise audio, otherwise fallback text */}
      {episode.youtube_video_id ? (
        <div className="mb-6 rounded border border-slate-800 bg-slate-900/70 p-4">
          <VideoPlayer videoId={episode.youtube_video_id} />
        </div>
      ) : episode.audio_url ? (
        <div className="mb-6 rounded border border-slate-800 bg-slate-900/70 p-4">
          <AudioPlayer src={episode.audio_url} />
        </div>
      ) : (
        <p className="mb-6 text-sm text-slate-400">
          No audio or video available for this episode.
        </p>
      )}

      {episode.published_at && (
        <p className="mb-4 text-xs text-slate-500">
          {new Date(episode.published_at).toLocaleDateString()}
        </p>
      )}

      {episode.description && (
        <article
          className="prose prose-invert prose-slate mt-4 max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: episode.description }}
        />
      )}
    </main>
  );
}
