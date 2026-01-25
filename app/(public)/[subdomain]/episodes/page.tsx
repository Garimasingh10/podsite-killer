// app/(public)/[subdomain]/episodes/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';

type EpisodesIndexProps = {
  params: { subdomain: string };
};

export default async function EpisodesIndex({ params }: EpisodesIndexProps) {
  const { subdomain } = params;

  const supabase = createSupabaseServerClient();

  const { data: podcast } = await supabase
    .from('podcasts')
    .select('title, description')
    .eq('id', subdomain)
    .maybeSingle();

  const { data: episodes, error } = await supabase
    .from('episodes')
    .select('id, title, slug, published_at')
    .eq('podcast_id', subdomain)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('episodes index error', error);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
      <h1 className="mb-2 text-3xl font-semibold">
        {podcast?.title || subdomain}
      </h1>
      <h2 className="mb-4 text-xl font-medium">All episodes</h2>

      {!episodes?.length ? (
        <p className="text-gray-500">No episodes yet.</p>
      ) : (
        <ul className="space-y-3">
          {episodes.map((ep) => (
            <li key={ep.id}>
              <Link
                href={`/${subdomain}/episodes/${ep.slug}`}
                className="text-blue-600 hover:underline"
              >
                {ep.title || ep.slug}
              </Link>
              {ep.published_at && (
                <div className="text-xs text-gray-500">
                  {new Date(ep.published_at).toISOString().slice(0, 10)}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
