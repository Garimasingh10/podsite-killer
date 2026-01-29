// app/(dashboard)/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { ActivePodcastSync } from '../_components/ActivePodcastSync';
import { NewPodcastForm } from '../_components/NewPodcastForm';
import { SearchForm } from '../_components/SearchForm';
import { PodcastCard } from '../_components/PodcastCard';

type PageProps = {
  searchParams?: { q?: string };
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const q = (searchParams?.q ?? '').trim();

  let queryBuilder = supabase
    .from('podcasts')
    .select(
      'id, title, description, rss_url, owner_id, youtube_channel_id, created_at',
    )
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (q) {
    queryBuilder = queryBuilder.ilike('title', `%${q}%`);
  }

  const { data: podcasts, error: podcastsError } = await queryBuilder;

  if (podcastsError) {
    console.error('dashboard podcasts error', podcastsError);
  }

  const rows =
    (podcasts as {
      id: string;
      title: string | null;
      description: string | null;
      rss_url: string | null;
      owner_id: string | null;
      youtube_channel_id: string | null;
    }[]) ?? [];

  const active = rows[0] ?? null;
  const others = rows.slice(1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              PODSITE-KILLER
            </p>
            <h1 className="mt-1 text-lg font-semibold text-slate-50">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px]">
              {user.email}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs text-slate-400">
              Import a podcast, sync episodes, and connect YouTube.
            </p>
          </div>
          <NewPodcastForm />
        </section>

        <section className="flex items-center justify-between gap-3">
          <SearchForm initialQuery={q} />
        </section>

        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            No podcasts yet. Import one using the button above.
          </p>
        ) : (
          <div className="space-y-6">
            {active && (
              <section className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-400">
                      Active podcast
                    </p>
                    <h2 className="text-lg font-semibold text-slate-50">
                      {active.title ?? 'Untitled'}
                    </h2>
                    {active.description && (
                      <p className="text-[12px] leading-relaxed text-slate-300 line-clamp-3">
                        {active.description}
                      </p>
                    )}
                    {active.rss_url && (
                      <p className="text-[11px] text-slate-400">
                        RSS:{' '}
                        <a
                          href={active.rss_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:underline"
                        >
                          {active.rss_url}
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-sky-400">
                    <span className="inline-flex items-center rounded-full bg-emerald-900/30 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                      ● Sync ready
                    </span>
                    <Link
                      href={`/${active.id}`}
                      className="hover:text-sky-300 hover:underline"
                    >
                      View site
                    </Link>
                    <Link
                      href={`/podcasts/${active.id}`}
                      className="hover:text-sky-300 hover:underline"
                    >
                      Episodes
                    </Link>
                    <Link
                      href={`/podcasts/${active.id}/youtube`}
                      className="hover:text-sky-300 hover:underline"
                    >
                      Sync YouTube
                    </Link>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Audio from RSS
                  </p>
                  <ActivePodcastSync
                    podcastId={active.id}
                    rssUrl={active.rss_url}
                    youtubeChannelId={active.youtube_channel_id}
                  />
                </div>
              </section>
            )}

            {others.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  All podcasts
                </h2>
                <ul className="grid gap-3 md:grid-cols-2">
                  {others.map((p) => (
                    <li key={p.id}>
                      <PodcastCard
                        podcast={{
                          id: p.id,
                          title: p.title ?? '(Untitled)',
                          description: p.description,
                          rss_url: p.rss_url,
                          youtube_channel_id: p.youtube_channel_id,
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
