// app/(dashboard)/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { NewPodcastForm } from './_components/NewPodcastForm';
import { SearchForm } from './_components/SearchForm';

type PageProps = {
  searchParams?: { q?: string };
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return (
      <main className="mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="text-sm text-slate-300">
          Please sign in to view your dashboard.
        </p>
        <Link
          href="/login"
          className="mt-3 text-xs font-medium text-sky-400 hover:underline"
        >
          Go to login →
        </Link>
      </main>
    );
  }

  const q = (searchParams?.q ?? '').trim();

  let queryBuilder = supabase
    .from('podcasts')
    .select('id, title, description, rss_url')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });

  if (q) {
    queryBuilder = queryBuilder.or(`title.ilike.%${q}%,rss_url.ilike.%${q}%`);
  }

  const { data: podcasts } = await queryBuilder;
  const rows =
    (podcasts as {
      id: string;
      title: string | null;
      description: string | null;
      rss_url: string | null;
    }[]) ?? [];
  const active = rows[0];

  const firstName =
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    session.user.email?.split('@')[0] ||
    'there';

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-50">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Top hero bar */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 px-5 py-5 shadow-lg shadow-black/40">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                PodSite‑Killer
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-50">
                Hello {firstName}, your podcast site studio.
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Import a podcast, sync episodes, and connect YouTube.
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                Example feed:{' '}
                <a
                  href="https://feeds.simplecast.com/Sl5CSM3S"
                  target="_blank"
                  className="font-medium text-sky-400 hover:underline"
                >
                  The Daily (NYT) RSS
                </a>
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <NewPodcastForm />
            </div>
          </div>
        </section>

        {/* Main grid: left = active podcast, right = search + list */}
        <section className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {/* Left: active podcast details */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Active podcast
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-50">
                  {active?.title ?? 'No podcast selected'}
                </h2>
              </div>
              {active && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Sync ready
                </span>
              )}
            </div>

            {active ? (
              <>
                {active.description && (
                  <p className="mt-3 max-h-32 overflow-hidden text-xs leading-relaxed text-slate-300">
                    {active.description}
                  </p>
                )}

                {active.rss_url && (
                  <p className="mt-3 text-[11px] text-slate-500">
                    RSS feed:{' '}
                    <a
                      href={active.rss_url}
                      target="_blank"
                      className="break-all text-sky-400 hover:underline"
                    >
                      {active.rss_url}
                    </a>
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium">
                  <Link
                    href={`/dashboard/podcasts/${active.id}/episodes`}
                    className="rounded-full border border-slate-700 px-3 py-1 text-slate-100 hover:border-sky-500 hover:text-sky-300"
                  >
                    Episodes
                  </Link>
                  <Link
                    href={`/dashboard/podcasts/${active.id}/youtube`}
                    className="rounded-full border border-slate-700 px-3 py-1 text-slate-100 hover:border-sky-500 hover:text-sky-300"
                  >
                    Sync YouTube
                  </Link>
                  <Link
                    href={`/${active.id}`}
                    className="rounded-full border border-slate-700 px-3 py-1 text-slate-100 hover:border-sky-500 hover:text-sky-300"
                  >
                    View site ↗
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-4 text-xs text-slate-400">
                Import a podcast with the button above to see details here.
              </p>
            )}
          </div>

          {/* Right: search + list of all podcasts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Your library
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  All podcasts in your account.
                </p>
              </div>
              <SearchForm initialQuery={q} />
            </div>

            {rows.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-center">
                <p className="text-sm text-slate-200">
                  {q ? `No matches for "${q}"` : 'No podcasts yet.'}
                </p>
                {q && (q.startsWith('http://') || q.startsWith('https://')) ? (
                  <div className="mt-4">
                    <p className="text-xs text-slate-400 mb-3">
                      This looks like a new podcast feed.
                    </p>
                    <NewPodcastForm initialRss={q} />
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Paste an RSS feed (for example{' '}
                    <span className="font-mono text-sky-400">
                      https://feeds.simplecast.com/Sl5CSM3S
                    </span>
                    ) into <span className="font-medium text-sky-400">New podcast</span> to
                    create your first site.
                  </p>
                )}
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {rows.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/90 p-3"
                  >
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Podcast
                      </p>
                      <h4 className="mt-1 text-sm font-semibold text-slate-50">
                        {p.title || 'Untitled podcast'}
                      </h4>
                      {p.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {p.description}
                        </p>
                      )}
                      {p.rss_url && (
                        <p className="mt-2 break-all text-[11px] text-slate-500">
                          RSS:{' '}
                          <a
                            href={p.rss_url}
                            target="_blank"
                            className="text-sky-400 hover:underline"
                          >
                            {p.rss_url}
                          </a>
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/${p.id}`}
                      className="rounded-full border border-slate-700 px-3 py-1 text-[11px] font.medium text-sky-400 hover:border-sky-500 hover:text-sky-300"
                    >
                      Open site ↗
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
