// app/(public)/[subdomain]/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';

const PAGE_SIZE = 10;

// NOTE: params & searchParams are Promises here
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

  const supabase = await createSupabaseServerClient();

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
  const latest = page === 1 ? episodes?.[0] : undefined;
  const rest = page === 1 ? episodes?.slice(1) ?? [] : episodes ?? [];

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
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-sky-400">
          The Daily
        </p>
        <h1 className="mb-2 text-3xl font-semibold">{podcast.title}</h1>
        {podcast.description && (
          <p className="max-w-2xl text-sm text-slate-300">
            {podcast.description}
          </p>
        )}
      </header>

      {/* The Latest — featured episode (changes daily as new episodes publish) */}
      {latest && (
        <section
          className="mb-8 rounded-xl border border-slate-700 bg-slate-900/80 p-5 shadow-sm"
          aria-label="The Latest"
        >
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-sky-400">
            The Latest
          </h2>

          {latest.slug ? (
            <Link
              href={`/${subdomain}/episodes/${latest.slug}`}
              className="block text-lg font-semibold text-slate-50 hover:underline sm:text-xl"
            >
              {latest.title || latest.slug}
            </Link>
          ) : (
            <span className="block text-lg font-semibold text-slate-50 sm:text-xl">
              {latest.title || '(no slug)'}
            </span>
          )}

          {latest.published_at && (
            <p className="mt-1 text-xs text-slate-500">
              {new Date(latest.published_at).toLocaleDateString()}
            </p>
          )}

          {latest.slug && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={`/${subdomain}/episodes/${latest.slug}`}
                className="inline-flex items-center rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-400"
              >
                Listen now
              </Link>
              <Link
                href={`/${subdomain}/episodes`}
                className="text-sm font-medium text-sky-400 hover:underline"
              >
                All episodes →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* All episodes — clickable list */}
      <section aria-label="All episodes">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            All episodes
          </h2>
          <Link
            href={`/${subdomain}/episodes`}
            className="text-xs font-semibold text-sky-400 hover:underline"
          >
            View all →
          </Link>
        </div>

        {!rest.length && !latest ? (
          <p className="text-sm text-slate-500">No episodes yet.</p>
        ) : !rest.length && latest ? (
          <p className="text-sm text-slate-500">
            Only the latest episode is available.{' '}
            <Link
              href={`/${subdomain}/episodes`}
              className="text-sky-400 hover:underline"
            >
              See full archive
            </Link>
          </p>
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
                    <span className="text-xs text-slate-500 shrink-0">
                      {new Date(ep.published_at).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
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
