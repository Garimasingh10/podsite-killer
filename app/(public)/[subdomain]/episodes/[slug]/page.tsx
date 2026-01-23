// app/(public)/[subdomain]/episodes/[slug]/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { AudioPlayer } from '@/components/public/AudioPlayer';
import { VideoPlayer } from '@/components/public/VideoPlayer';

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ subdomain: string; slug: string }>;
}) {
  const { subdomain, slug } = await params;

  const supabase = await createSupabaseServerClient();

  // Optional: ignore missing auth on public route
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError && authError.name !== 'AuthSessionMissingError') {
      console.error('episode auth error', authError);
    }
    console.log('episode auth user', user?.id);
  } catch (e: any) {
    if (!e?.__isAuthError) {
      console.error('episode auth error', e);
    } else {
      console.log('no auth session (public route)');
    }
  }

  // Load episode by podcast_id (subdomain) + slug
  const { data: episode, error: episodeError } = await supabase
    .from('episodes')
    .select('*')
    .eq('podcast_id', subdomain)
    .eq('slug', slug)
    .single();

  if (episodeError || !episode) {
    console.error('episodeError', episodeError);
    return (
      <main>
        <h1>Episode not found</h1>
        <p>podcastId: {subdomain}</p>
        <p>slug: {slug}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{episode.title || slug}</h1>

      {episode.youtube_video_id ? (
        <VideoPlayer videoId={episode.youtube_video_id} />
      ) : episode.audio_url ? (
        <AudioPlayer src={episode.audio_url} />
      ) : (
        <p>No audio or video available for this episode.</p>
      )}

      {episode.description && (
        <article
          dangerouslySetInnerHTML={{ __html: episode.description }}
        />
      )}
    </main>
  );
}
