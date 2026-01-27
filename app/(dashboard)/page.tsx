// app/(dashboard)/episodes/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function EpisodesDashboardPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const supabase = createSupabaseServerClient();

  const query = (q || '').trim();

  let builder = supabase
    .from('episodes')
    .select('id, title, slug, podcast_id, published_at')
    .order('published_at', { ascending: false })
    .limit(50);

  if (query) {
    builder = builder.ilike('title', `%${query}%`);
  }

  const { data: episodes, error } = await builder;

  if (error) {
    console.error('episodes dashboard search error', error);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 font-sans">
      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Episodes</h1>
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search episodes…"
            className="rounded bg-slate-800 px-3 py-2 text-sm text-slate-100"
          />
          <button
            type="submit"
            className="rounded bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-300"
          >
            Search
          </button>
        </form>
      </header>

      {!episodes?.length ? (
        <p className="text-sm text-slate-400">
          {query
            ? `No episodes found for "${query}".`
            : 'No episodes yet.'}
        </p>
      ) : (
        <ul className="divide-y divide-slate-800">
          {episodes.map((ep) => (
            <li key={ep.id} className="py-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-slate-100">
                    {ep.title || '(Untitled episode)'}
                  </span>
                  {ep.published_at && (
                    <span className="whitespace-nowrap text-xs text-slate-500">
                      {new Date(ep.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  <span className="mr-2">
                    Podcast: <code>{ep.podcast_id}</code>
                  </span>
                  {ep.slug && (
                    <Link
                      href={`/${ep.podcast_id}/episodes/${ep.slug}`}
                      className="text-sky-400 hover:underline"
                    >
                      View public page →
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
