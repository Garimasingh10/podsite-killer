// app/(public)/[subdomain]/episodes/[slug]/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { AudioPlayer } from '@/components/public/AudioPlayer';
import { VideoPlayer } from '@/components/public/VideoPlayer';

export default async function EpisodePage(props: {
  params: Promise<{ subdomain: string; slug: string }>;
}) {
  const { params } = props;
  const { subdomain, slug } = await params;

  if (!slug || slug === 'null') {
    console.error('episode route: invalid slug', { subdomain, slug });
    return (
      <main>
        <h1>Episode not found</h1>
        <p>podcastId: {subdomain}</p>
        <p>slug is missing or invalid: {String(slug)}</p>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();

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

  const { data: episode, error: episodeError } = await supabase
    .from('episodes')
    .select('*')
    .eq('podcast_id', subdomain)
    .eq('slug', slug)
    .maybeSingle();

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
        <article dangerouslySetInnerHTML={{ __html: episode.description }} />
      )}
    </main>
  );
}
