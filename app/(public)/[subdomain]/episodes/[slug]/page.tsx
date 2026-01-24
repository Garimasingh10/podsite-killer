import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { AudioPlayer } from '@/components/public/AudioPlayer';
import { VideoPlayer } from '@/components/public/VideoPlayer';

type EpisodePageProps = {
  params: Promise<{ subdomain: string; slug: string }>;
};

export default async function EpisodePage(props: EpisodePageProps) {
  const { params } = props;
  const { subdomain, slug } = await params;

  if (!slug || slug === 'null' || slug === 'undefined') {
    console.error('episode route: invalid slug', { subdomain, slug });
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
        <h1 className="mb-2 text-2xl font-semibold">Episode not found</h1>
        <p>podcastId: {subdomain}</p>
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
        <p>podcastId: {subdomain}</p>
        <p>slug: {slug}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
      <h1 className="mb-4 text-2xl font-semibold">
        {episode.title || slug}
      </h1>

      {episode.youtube_video_id ? (
        <VideoPlayer videoId={episode.youtube_video_id} />
      ) : episode.audio_url ? (
        <AudioPlayer src={episode.audio_url} />
      ) : (
        <p>No audio or video available for this episode.</p>
      )}

      {episode.description && (
        <article
          className="prose prose-slate mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: episode.description }}
        />
      )}
    </main>
  );
}
