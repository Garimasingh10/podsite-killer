// app/(public)/[subdomain]/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';

const PAGE_SIZE = 20;

export default async function PodcastHome({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>;
  searchParams?: { page?: string };
}) {
  const { subdomain } = await params;
  const page = Number(searchParams?.page ?? '1') || 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createSupabaseServerClient();

  // Podcast info (non-blocking; use maybeSingle to avoid PGRST116)
  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .select('*')
    .eq('id', subdomain)
    .maybeSingle();

  if (podcastError) {
    console.error('podcastError', podcastError);
  }

  // Paginated episodes
  const {
    data: episodes,
    error: episodesError,
  } = await supabase
    .from('episodes')
    .select('id, title, slug, published_at')
    .eq('podcast_id', subdomain)
    .order('published_at', { ascending: false })
    .range(from, to);

  if (episodesError) {
    console.error('episodesError', episodesError);
    return <main>Error loading episodes</main>;
  }

  const hasMore = episodes && episodes.length === PAGE_SIZE;

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>{podcast?.title || subdomain}</h1>
      {podcast?.description && <p>{podcast.description}</p>}

      {!episodes || episodes.length === 0 ? (
        <p>No episodes yet.</p>
      ) : (
        <>
          <ul>
            {episodes.map((ep) => (
              <li key={ep.id}>
                <Link href={`/${subdomain}/episodes/${ep.slug}`}>
                  {ep.title || ep.slug}
                </Link>
                {ep.published_at && (
                  <span>
                    {' '}
                    – {new Date(ep.published_at).toISOString().slice(0, 10)}
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            {page > 1 && (
              <Link href={`/${subdomain}?page=${page - 1}`}>
                <button>Previous</button>
              </Link>
            )}
            {hasMore && (
              <Link href={`/${subdomain}?page=${page + 1}`}>
                <button>Next</button>
              </Link>
            )}
          </div>
        </>
      )}
    </main>
  );
}
