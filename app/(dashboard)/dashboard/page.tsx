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
      {/* Top Welcome / Search Hero */}
      <section className="animate-fade-in-up rounded-3xl glass-card relative overflow-hidden p-8 mb-8">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl opacity-50" />
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white leading-none">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">Creator.</span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              Manage your podcast sites, sync your content, and grow your audience.
              Paste an RSS feed to get started instantly.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto">
            <NewPodcastForm />
            <p className="text-[10px] text-slate-500 text-center md:text-left uppercase tracking-widest font-bold opacity-50">
              Search library or paste RSS to import
            </p>
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

      {/* Featured / Active Podcast Section */}
      {active && (
        <section className="animate-fade-in-up [animation-delay:100ms] grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl glass-card p-6 transition-all hover:bg-slate-900/60 hover:shadow-2xl">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/5 blur-3xl transition-all group-hover:bg-sky-500/10" />

              <div className="relative flex flex-col gap-8 sm:flex-row">
                {active.theme_config?.imageUrl && (
                  <div className="shrink-0">
                    <img
                      src={active.theme_config.imageUrl}
                      alt={active.title || 'Podcast'}
                      className="h-40 w-40 rounded-2xl object-cover shadow-2xl ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 ring-1 ring-emerald-500/20">
                      Active Workspace
                    </span>
                    <Link
                      href={`/${active.id}`}
                      target="_blank"
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black hover:shadow-lg"
                    >
                      Visit Local Site <span className="text-[10px]">↗</span>
                    </Link>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white leading-tight">
                      {active.title}
                    </h2>
                    <p className="mt-1 text-xs font-mono text-slate-500 truncate max-w-xs opacity-60">
                      {active.rss_url}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-400 line-clamp-2">
                    {active.description || 'No description available for this podcast.'}
                  </p>
                </div>
              </div>

              <div className="relative mt-8 grid grid-cols-2 gap-4">
                <Link
                  href={`/podcasts/${active.id}/episodes`}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] py-4 text-sm font-black uppercase tracking-widest transition-all hover:bg-white/[0.08] hover:scale-[1.02] hover:shadow-xl active:scale-95"
                >
                  <span className="text-lg">🎧</span>
                  Episodes
                </Link>
                <Link
                  href={`/podcasts/${active.id}/settings`}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] py-4 text-sm font-black uppercase tracking-widest transition-all hover:bg-white/[0.08] hover:scale-[1.02] hover:shadow-xl active:scale-95"
                >
                  <span className="text-lg">⚙️</span>
                  Settings
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl glass-card p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/5 blur-2xl group-hover:bg-red-500/10 transition-all" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                YouTube Connection
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sync your YouTube videos with your podcast episodes automatically.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="UC123abc..."
                  className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs text-white placeholder:text-slate-700 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/20 transition-all font-mono"
                />
                <button className="rounded-xl bg-sky-500 py-3 text-xs font-black uppercase tracking-widest text-slate-950 transition-all hover:bg-sky-400 hover:shadow-lg hover:shadow-sky-500/20 active:scale-95">
                  Link Channel
                </button>
              </div>
            </div>

            <div className="rounded-3xl glass-card p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-all" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                Audience Data
              </h3>
              <div className="mt-12 flex items-center justify-center border-t border-white/5 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 opacity-30">Coming Phase 3</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Library Section */}
      {others.length > 0 && (
        <section className="animate-fade-in-up [animation-delay:200ms] space-y-8 pt-12 pb-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/5 pb-8">
            <div className="space-y-1">
              <h3 className="text-3xl font-black tracking-tighter text-white leading-none">
                {q ? `Results for "${q}"` : 'Studio Library'}
              </h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest opacity-60">Manage your entire collection</p>
            </div>
            {!q && (
              <div className="w-full sm:w-72">
                <SearchForm initialQuery={q} placeholder="Filter library..." />
              </div>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <Link
                key={p.id}
                href={`/podcasts/${p.id}/episodes`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl glass-card p-6 transition-all hover:-translate-y-2 hover:bg-white/[0.04] hover:shadow-2xl"
              >
                <div className="flex gap-4">
                  {p.theme_config?.imageUrl && (
                    <div className="shrink-0 relative">
                      <img
                        src={p.theme_config.imageUrl}
                        alt={p.title || 'Show'}
                        className="h-16 w-16 rounded-2xl object-cover shadow-lg ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-lg font-black tracking-tight text-slate-100 group-hover:text-sky-400 transition-colors truncate">
                      {p.title || 'Untitled'}
                    </h4>
                    {p.description && (
                      <p className="text-xs leading-relaxed text-slate-500 line-clamp-2 opacity-80">
                        {p.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Workspace</span>
                  </div>
                  <span className="rounded-lg bg-white/5 px-2 py-1 text-[9px] font-mono text-slate-600 tracking-tighter">
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
