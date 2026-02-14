// app/(dashboard)/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NewPodcastForm } from '../_components/NewPodcastForm';
import { SearchForm } from '../_components/SearchForm';
import { ActivePodcastSync } from '../_components/ActivePodcastSync';
import { Headphones, Clock } from 'lucide-react';

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
      'id, title, description, rss_url, owner_id, youtube_channel_id, theme_config, created_at',
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
      theme_config: any;
    }[]) ?? [];

  // Logic: First podcast in list is "Active", others are "Library"
  const active = rows.length > 0 ? rows[0] : null;
  const others = rows.length > 0 ? rows : [];

  const hasPodcasts = rows.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Welcome Section (Modern & Minimal) */}
      <section className="animate-fade-in-up rounded-[2rem] bg-indigo-600 dark:bg-zinc-900 border border-indigo-500/20 dark:border-zinc-800 relative overflow-hidden p-10 mb-10 shadow-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl opacity-50" />
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">
              Welcome back, <span className="opacity-80">Creator</span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-indigo-100 dark:text-zinc-400 font-medium">
              Your studio is synchronized and your audience is growing.
              Paste an RSS feed to launch a new site.
            </p>
          </div>
          <div className="flex w-full flex-col gap-4 sm:w-auto">
            <div className="rounded-2xl bg-white/10 dark:bg-white/[0.03] p-1 ring-1 ring-white/20">
              <NewPodcastForm />
            </div>
          </div>
        </div>
      </section>

      {!hasPodcasts && (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.02] py-24 text-center">
          {q && (q.startsWith('http://') || q.startsWith('https://')) ? (
            <div className="max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-sky-500/10 p-5 ring-1 ring-sky-500/20 animate-pulse">
                  <span className="text-3xl">🎙️</span>
                </div>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Import this Podcast?</h3>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                "{q}" isn't in your library yet. We can import it and build your premium site instantly.
              </p>
              <div className="mt-8">
                <NewPodcastForm initialRss={q} />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 shadow-inner">
                <span className="text-4xl filter grayscale">📡</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {q ? `No matches for "${q}"` : 'Your Studio is Ready'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
                {q
                  ? 'Try a different search term or paste an RSS URL to import a new show.'
                  : 'Import your first RSS feed to generate a stunning, auto-updating podcast website.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Active Selection (Premium Card) */}
      {active && (
        <section className="animate-fade-in-up [animation-delay:100ms] grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 transition-all hover:shadow-2xl">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-zinc-500/5 blur-3xl" />

              <div className="relative flex flex-col gap-8 sm:flex-row">
                {active.theme_config?.imageUrl && (
                  <div className="shrink-0 relative">
                    <img
                      src={active.theme_config.imageUrl}
                      alt={active.title || 'Podcast'}
                      className="h-44 w-44 rounded-3xl object-cover shadow-2xl ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 rounded-3xl ring-inset ring-1 ring-white/10" />
                  </div>
                )}
                <div className="flex-1 space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                      Primary Site
                    </span>
                    <Link
                      href={`/${active.id}`}
                      target="_blank"
                      className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      Browse Site <span className="text-[10px]">↗</span>
                    </Link>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {active.title}
                    </h2>
                    <p className="mt-1.5 text-xs font-medium text-zinc-400 font-mono opacity-80">
                      {active.rss_url}
                    </p>
                  </div>
                  <p className="text-base leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {active.description || 'Launch your podcast world. No description set.'}
                  </p>
                </div>
              </div>

              <div className="relative mt-8 grid grid-cols-2 gap-4">
                <Link
                  href={`/podcasts/${active.id}/episodes`}
                  className="flex items-center justify-center gap-3 rounded-2xl bg-zinc-900 dark:bg-white py-4 text-sm font-bold uppercase tracking-widest text-white dark:text-zinc-950 transition-all hover:scale-[1.02] shadow-sm"
                >
                  <Headphones size={18} />
                  Manage Episodes
                </Link>
                <Link
                  href={`/podcasts/${active.id}/settings`}
                  className="flex items-center justify-center gap-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 py-4 text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition-all hover:scale-[1.02]"
                >
                  <Clock size={18} />
                  Site Settings
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">
                YouTube Sync
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Link your channel to automatically pull Shorts and video episodes.
              </p>
              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Channel ID (UC...)"
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-5 py-3.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
                <button className="w-full rounded-xl bg-indigo-600 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]">
                  Connect Channel
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-500/5 p-8 border border-indigo-100 dark:border-indigo-500/10 transition-all text-center">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-2">
                Insights
              </h3>
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                  <Clock size={20} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 dark:text-indigo-400/50">Analytics Coming Soon</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Library Section (Clean Grid) */}
      {others.length > 0 && (
        <section className="animate-fade-in-up [animation-delay:200ms] space-y-10 pt-16 pb-32">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-10">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {q ? `Results for "${q}"` : 'Your Studio Library'}
              </h3>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest opacity-80">Connected RSS Feeds</p>
            </div>
            {!q && (
              <div className="w-full sm:w-80">
                <SearchForm initialQuery={q} placeholder="Filter your shows..." />
              </div>
            )}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <Link
                key={p.id}
                href={`/podcasts/${p.id}/episodes`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 transition-all hover:scale-[1.03] hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:border-indigo-500/30"
              >
                <div className="flex gap-6">
                  {p.theme_config?.imageUrl && (
                    <div className="shrink-0">
                      <img
                        src={p.theme_config.imageUrl}
                        alt={p.title || 'Show'}
                        className="h-20 w-20 rounded-2xl object-cover shadow-md ring-1 ring-black/5 dark:ring-white/10"
                      />
                    </div>
                  )}
                  <div className="space-y-2 min-w-0">
                    <h4 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {p.title || 'Untitled'}
                    </h4>
                    {p.description && (
                      <p className="text-sm leading-relaxed text-zinc-500 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Live Workspace</span>
                  </div>
                  <span className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-[10px] font-mono text-zinc-400">
                    {p.id.slice(0, 8)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
