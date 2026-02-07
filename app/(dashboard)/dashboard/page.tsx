// app/(dashboard)/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NewPodcastForm } from '../_components/NewPodcastForm';
import { SearchForm } from '../_components/SearchForm';
import { ActivePodcastSync } from '../_components/ActivePodcastSync';

type PageProps = {
  searchParams: Promise<{ q?: string }>;
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

  const resolved = await searchParams;
  const q = (resolved.q ?? '').trim();

  let queryBuilder = supabase
    .from('podcasts')
    .select(
      'id, title, description, rss_url, owner_id, youtube_channel_id, created_at',
    )
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (q) {
    queryBuilder = queryBuilder.or(`title.ilike.%${q}%,rss_url.ilike.%${q}%`);
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

  // Logic: First podcast in list is "Active", others are "Library"
  const active = rows.length > 0 ? rows[0] : null;
  const others = rows.length > 1 ? rows.slice(1) : [];

  const hasPodcasts = rows.length > 0;
  if (active) console.log('Dashboard Active ID:', active.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero / Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl filter" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl filter" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-xl space-y-2">
            <h1 className="bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Welcome back, Creator.
            </h1>
            <p className="text-slate-400">
              Manage your podcast sites, sync your content, and grow your audience.
              Paste an RSS feed to get started instantly.
            </p>
          </div>
          <div className="flex w-full max-w-lg flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <SearchForm initialQuery={q} placeholder="Search your library..." className="flex-1" />
              <NewPodcastForm />
            </div>
            <p className="text-right text-[10px] text-slate-500">
              Search existing or paste RSS to import.
            </p>
          </div>
        </div>
      </section>

      {!hasPodcasts && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 py-20 text-center">
          {q && (q.startsWith('http://') || q.startsWith('https://')) ? (
            <div className="max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-sky-500/10 p-4 ring-1 ring-sky-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-sky-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">Import this Podcast?</h3>
              <p className="mt-2 text-sm text-slate-400">
                "{q}" isn't in your library yet. We can import it and sync all episodes instantly.
              </p>
              <div className="mt-6">
                <NewPodcastForm initialRss={q} />
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-full bg-slate-900 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-slate-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-200">
                {q ? `No matches for "${q}"` : 'No podcasts yet'}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {q
                  ? 'Try a different search term or paste an RSS URL to import a new show.'
                  : 'Import your first RSS feed using the form above to generate your site.'}
              </p>
            </>
          )}
        </div>
      )}

      {/* Active Workspace */}
      {active && (
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 shadow-xl backdrop-blur-md">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <span className="inline-block rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                  Active Podcast
                </span>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  {active.title || 'Untitled Podcast'}
                </h2>
                {active.rss_url && (
                  <a href={active.rss_url} target="_blank" className="mt-1 block text-xs text-slate-500 hover:text-sky-400 hover:underline">
                    {active.rss_url}
                  </a>
                )}
              </div>
              <Link
                href={`/${active.id}`}
                target="_blank"
                className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-transform hover:scale-105 active:scale-95"
              >
                View Site
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>

            <p className="mb-8 text-sm leading-relaxed text-slate-400 line-clamp-3">
              {active.description || 'No description available for this podcast.'}
            </p>

            <div className="flex gap-3 border-t border-slate-800/50 pt-6">
              <Link
                href={`/podcasts/${active.id}/episodes`}
                className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
              >
                <svg width={16} height={16} className="h-4 w-4 text-slate-400 group-hover:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Episodes
              </Link>
              <Link
                href={`/podcasts/${active.id}/settings`}
                className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
              >
                <svg width={16} height={16} className="h-4 w-4 text-slate-400 group-hover:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <ActivePodcastSync
              podcastId={active.id}
              rssUrl={active.rss_url}
              youtubeChannelId={active.youtube_channel_id}
            />
            <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Analytics</h3>
              <div className="mt-4 flex h-full items-center justify-center text-sm text-slate-600">
                <p>Coming in Phase 3</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Other Podcasts */}
      {(active && others.length > 0) || (q && others.length > 0) ? (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-200">
              {q ? `More results for "${q}"` : 'Your Library'}
            </h3>
            {!q && (
              <div className="w-64">
                <SearchForm initialQuery={q} />
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <Link
                key={p.id}
                href={`/podcasts/${p.id}/episodes`} // Make the whole card clickable for convenience
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition-all hover:border-sky-500/30 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-sky-500/5"
              >
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                    {p.title || 'Untitled'}
                  </h4>
                  {p.description && (
                    <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-800/50 pt-3 text-[10px] text-slate-500">
                  <div className="flex items-center gap-2">
                    {p.youtube_channel_id ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        YT Connected
                      </span>
                    ) : (
                      <span>Audio Only</span>
                    )}
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform">Manage →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
