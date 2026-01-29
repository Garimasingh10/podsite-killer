// app/(dashboard)/podcasts/[id]/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type PageProps = {
  params: { id: string };
};

export default async function PodcastPage({ params }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const podcastId = params.id;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .select('id, title')
    .eq('id', podcastId)
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!podcast || podcastError) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p>Podcast not found.</p>
      </main>
    );
  }

  const { data: episodes, error: episodesError } = await supabase
    .from('episodes')
    .select('*')
    .eq('podcast_id', podcastId)
    .order('published_at', { ascending: false });

  if (episodesError) {
    console.error('Error fetching episodes:', episodesError);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {podcast.title} – Episodes
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            These are the episodes for this podcast only.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-sky-500 hover:underline"
        >
          ← Back to dashboard
        </Link>
      </header>

      {(!episodes || episodes.length === 0) ? (
        <p className="text-xs text-slate-500">No episodes yet.</p>
      ) : (
        <ul className="space-y-2">
          {episodes.map((episode: any) => (
            <li
              key={episode.id}
              className="rounded border border-slate-800 px-3 py-2 text-xs text-slate-200"
            >
              <div className="font-semibold">{episode.title}</div>
              {episode.published_at && (
                <div className="text-[10px] text-slate-500">
                  {new Date(episode.published_at).toLocaleString()}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
