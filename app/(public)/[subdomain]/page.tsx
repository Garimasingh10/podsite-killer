// app/(public)/[subdomain]/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';

const PAGE_SIZE = 20;

type PageProps = {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function PodcastHome({ params, searchParams }: PageProps) {
  const { subdomain } = await params;
  const { page: pageParam } = await searchParams;

  const page = Number(pageParam ?? '1') || 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createSupabaseServerClient();

  const { data: podcast, error: podcastError } = await supabase
    .from('podcasts')
    .select('*')
    .eq('id', subdomain)
    .maybeSingle();

  if (podcastError || !podcast) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
        <h1 className="mb-2 text-3xl font-semibold">Podcast not found</h1>
        <p className="mt-2 text-sm text-slate-400">
          Could not load podcast with id <code>{String(subdomain)}</code>.
        </p>
      </main>
    );
  }

  const { data: episodes, error: episodesError } = await supabase
    .from('episodes')
    .select('id, title, slug, published_at')
    .eq('podcast_id', subdomain)
    .order('published_at', { ascending: false })
    .range(from, to);

  if (episodesError) {
    console.error('episodesError', episodesError);
  }

  const hasMore = episodes && episodes.length === PAGE_SIZE;

  // Page 1: show latest highlight + rest
  // Page 2+: show all episodes in list
  const latest = page === 1 ? episodes?.[0] : undefined;
  const rest =
    page === 1 ? episodes?.slice(1) ?? [] : episodes ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 font-sans">
      {podcast.image_url && (
        <div className="relative mb-6 h-32 w-full overflow-hidden rounded-lg bg-slate-900 sm:h-40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={podcast.image_url}
            alt={podcast.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <header className="mb-6">
        <h1 className="mb-2 text-3xl font-semibold">{podcast.title}</h1>
        {podcast.description && (
          <p className="max-w-2xl text-sm text-slate-300">
            {podcast.description}
          </p>
        )}
      </header>

      {latest && (
        <section className="mb-8 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-400">
            Latest episode
          </p>

          {latest.slug ? (
            <Link
              href={`/${subdomain}/episodes/${latest.slug}`}
              className="text-base font-semibold text-slate-50 hover:underline"
            >
              {latest.title || latest.slug}
            </Link>
          ) : (
            <span className="text-base font-semibold text-slate-50">
              {latest.title || '(no slug)'}
            </span>
          )}

          {latest.published_at && (
            <p className="mt-1 text-xs text-slate-500">
              {new Date(latest.published_at).toLocaleDateString()}
            </p>
          )}

          {latest.slug && (
            <div className="mt-3 flex flex-col gap-1">
              <Link
                href={`/${subdomain}/episodes/${latest.slug}`}
                className="inline-flex items-center rounded bg-sky-400 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-sky-300"
              >
                Listen now
              </Link>
              <span className="text-xs text-slate-500">
                Or browse all episodes below.
              </span>
            </div>
          )}
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            All episodes
          </h2>
          <Link
            href={`/${subdomain}/episodes`}
            className="text-xs font-semibold text-sky-400 hover:underline"
          >
            View full archive →
          </Link>
        </div>

        {!rest.length ? (
          <p className="text-sm text-slate-500">No episodes yet.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {rest.map((ep) => (
              <li key={ep.id} className="py-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  {ep.slug ? (
                    <Link
                      href={`/${subdomain}/episodes/${ep.slug}`}
                      className="text-sm font-medium text-slate-100 hover:underline"
                    >
                      {ep.title || ep.slug}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-slate-100">
                      {ep.title || '(no slug)'}
                    </span>
                  )}
                  {ep.published_at && (
                    <span className="text-xs text-slate-500">
                      {new Date(ep.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex gap-2">
          {page > 1 && (
            <Link href={`/${subdomain}?page=${page - 1}`}>
              <button className="rounded border border-slate-700 px-3 py-1 text-xs">
                Previous
              </button>
            </Link>
          )}
          {hasMore && (
            <Link href={`/${subdomain}?page=${page + 1}`}>
              <button className="rounded border border-slate-700 px-3 py-1 text-xs">
                Next
              </button>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
