import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import type { Metadata } from 'next';

const PAGE_SIZE = 20;

type PageProps = {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata(
  props: { params: Promise<{ subdomain: string }> },
): Promise<Metadata> {
  const { params } = props;
  const { subdomain } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: podcast } = await supabase
    .from('podcasts')
    .select('title, description')
    .eq('id', subdomain)
    .maybeSingle();

  const title = podcast?.title || `Podcast ${subdomain}`;
  const description =
    podcast?.description ||
    'A podcast powered by PodSite-Killer. Listen to the latest episodes.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function PodcastHome(props: PageProps) {
  const { params, searchParams } = props;
  const { subdomain } = await params;
  const resolvedSearch = await searchParams;

  const page = Number(resolvedSearch.page ?? '1') || 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createSupabaseServerClient();

  const {
    data: podcast,
    error: podcastError,
  } = await supabase
    .from('podcasts')
    .select('*')
    .eq('id', subdomain)
    .maybeSingle();

  if (podcastError) {
    console.error('podcastError', podcastError);
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
        <h1 className="mb-2 text-3xl font-semibold">Podcast not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          Could not load podcast with id <code>{subdomain}</code>.
        </p>
      </main>
    );
  }

  if (!podcast) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
        <h1 className="mb-2 text-3xl font-semibold">Podcast not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          No podcast exists with id <code>{subdomain}</code>.
        </p>
      </main>
    );
  }

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
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
        <h1 className="mb-2 text-3xl font-semibold">
          {podcast.title || subdomain}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Error loading episodes.
        </p>
      </main>
    );
  }

  const hasMore = episodes && episodes.length === PAGE_SIZE;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
      <h1 className="mb-2 text-3xl font-semibold">
        {podcast.title || subdomain}
      </h1>
      {podcast.description && (
        <p className="mb-6 text-gray-600">{podcast.description}</p>
      )}

      {!episodes || episodes.length === 0 ? (
        <p className="text-gray-500">No episodes yet.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {episodes.map((ep) => (
              <li key={ep.id} className="py-3">
                {ep.slug ? (
                  <Link
                    href={`/${subdomain}/episodes/${ep.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {ep.title || ep.slug}
                  </Link>
                ) : (
                  <span className="text-gray-500">
                    {ep.title || '(no slug)'}
                  </span>
                )}
                {ep.published_at && (
                  <div className="mt-1 text-xs text-gray-500">
                    {new Date(ep.published_at).toISOString().slice(0, 10)}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            {page > 1 && (
              <Link href={`/${subdomain}?page=${page - 1}`}>
                <button className="rounded border px-3 py-1 text-sm">
                  Previous
                </button>
              </Link>
            )}
            {hasMore && (
              <Link href={`/${subdomain}?page=${page + 1}`}>
                <button className="rounded border px-3 py-1 text-sm">
                  Next
                </button>
              </Link>
            )}
          </div>
        </>
      )}
    </main>
  );
}
