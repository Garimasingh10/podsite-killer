// app/(dashboard)/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { NewPodcastForm } from '../_components/NewPodcastForm';
import { SearchForm } from '../_components/SearchForm';
import { ActivePodcastSync } from '../_components/ActivePodcastSync';
import { Headphones, Clock } from 'lucide-react';
import ThemeEngine, { ThemeConfig } from '@/components/ThemeEngine';

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
      theme_config: ThemeConfig;
    }[]) ?? [];

  // Logic: First podcast in list is "Active", others are "Library"
  const active = rows.length > 0 ? rows[0] : null;
  const others = rows.length > 1 ? rows.slice(1) : [];

  const hasPodcasts = rows.length > 0;
  const primaryColor = active?.theme_config?.primaryColor || '#6366f1';
  const accentColor = active?.theme_config?.accentColor || '#8b5cf6';

  return (
    <>
      <ThemeEngine config={active?.theme_config || {}} scope=".dashboard-active-scope" />
      <div
        className="dashboard-active-scope space-y-8 animate-in fade-in duration-700"
        style={{
          '--podcast-primary': primaryColor,
          '--podcast-accent': accentColor,
        } as React.CSSProperties}
      >
        {/* Top Welcome Section (Vibrant & Magic) */}
        <section className="animate-fade-in-up rounded-[2.5rem] relative overflow-hidden p-10 mb-10 shadow-2xl border border-white/10"
          style={{
            background: `radial-gradient(circle at top right, ${primaryColor}44, transparent), radial-gradient(circle at bottom left, ${accentColor}22, #000)`,
          }}
        >
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[var(--podcast-primary)] blur-[100px] opacity-20 animate-pulse" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="space-y-3">
              <h1 className="text-5xl font-black tracking-tighter text-white leading-none italic">
                Welcome back, <span className="text-[var(--podcast-primary)]">Creator</span>
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-zinc-300 font-bold uppercase tracking-widest opacity-80">
                Your studio is live. Paste an RSS feed to launch a new universe.
              </p>
            </div>
            <div className="flex w-full flex-col gap-4 sm:w-auto">
              <div className="rounded-2xl bg-white/5 p-1 ring-1 ring-white/10 backdrop-blur-xl shadow-2xl">
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

        {/* Active Selection (Vibrant & Neo-Brutalist Magic) */}
        {active && (
          <section className="animate-fade-in-up [animation-delay:100ms] grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[3rem] bg-zinc-950 border-4 border-white/5 p-10 transition-all hover:border-[var(--podcast-primary)]/50 hover:shadow-[0_0_50px_-12px_var(--podcast-primary)]">
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[var(--podcast-primary)]/10 blur-[120px]" />

                <div className="relative flex flex-col gap-10 sm:flex-row items-center sm:items-start">
                  {active.theme_config?.imageUrl && (
                    <div className="shrink-0 relative">
                      <img
                        src={active.theme_config.imageUrl}
                        alt={active.title || 'Podcast'}
                        className="h-56 w-56 rounded-[2.5rem] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-4 ring-white/10 group-hover:scale-[1.05] transition-transform duration-700"
                      />
                      <div className="absolute inset-0 rounded-[2.5rem] ring-inset ring-1 ring-white/20" />
                    </div>
                  )}
                  <div className="flex-1 space-y-6 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <span className="rounded-full bg-[var(--podcast-primary)]/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--podcast-primary)] border border-[var(--podcast-primary)]/30">
                        Primary Workspace
                      </span>
                      <Link
                        href={`/${active.id}`}
                        target="_blank"
                        className="flex items-center gap-2 rounded-full border-2 border-white/10 bg-white/5 px-5 py-1.5 text-[11px] font-black uppercase tracking-wider text-white transition-all hover:bg-white/10 hover:border-[var(--podcast-primary)]/50"
                      >
                        Live Site <span className="text-[10px]">↗</span>
                      </Link>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-5xl font-black tracking-tighter text-white italic leading-tight">
                        {active.title}
                      </h2>
                      <p className="text-[10px] font-bold text-[var(--podcast-primary)] font-mono uppercase tracking-widest bg-[var(--podcast-primary)]/10 w-fit px-3 py-1 rounded mx-auto sm:mx-0">
                        {active.rss_url}
                      </p>
                    </div>
                    <p className="text-lg leading-relaxed text-zinc-400 line-clamp-2 font-medium">
                      {active.description || 'Launch your podcast world. No description set.'}
                    </p>
                  </div>
                </div>

                <div className="relative mt-12 grid grid-cols-2 gap-6">
                  <Link
                    href={`/podcasts/${active.id}/episodes`}
                    className="flex items-center justify-center gap-3 rounded-[1.5rem] bg-[var(--podcast-primary)] py-5 text-sm font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_var(--podcast-primary)] active:scale-[0.98]"
                  >
                    <Headphones size={20} strokeWidth={3} />
                    Manage Show
                  </Link>
                  <Link
                    href={`/podcasts/${active.id}/settings`}
                    className="flex items-center justify-center gap-3 rounded-[1.5rem] bg-white/5 py-5 text-sm font-black uppercase tracking-widest text-white border-2 border-white/10 transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Clock size={20} strokeWidth={3} />
                    Settings
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <ActivePodcastSync
                podcastId={active.id}
                youtubeChannelId={active.youtube_channel_id}
              />

              <div className="rounded-[2.5rem] bg-[var(--podcast-primary)]/10 p-8 border border-[var(--podcast-primary)]/20 transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[var(--podcast-primary)]/20 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--podcast-primary)] mb-2 italic">
                  Insights
                </h3>
                <div className="py-6 flex flex-col items-center justify-center relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-[var(--podcast-primary)]/20 flex items-center justify-center text-[var(--podcast-primary)] mb-3 border border-[var(--podcast-primary)]/20 shadow-lg shadow-[var(--podcast-primary)]/10">
                    <Clock size={24} strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--podcast-primary)] opacity-60">Analytics Soon</p>
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
              {others.map((p) => {
                const pColor = p.theme_config?.primaryColor || '#6366f1';
                return (
                  <Link
                    key={p.id}
                    href={`/podcasts/${p.id}/episodes`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-zinc-950 border-4 border-white/5 p-8 transition-all hover:-translate-y-2 hover:border-[var(--podcast-primary)]/50 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
                    style={{ '--podcast-item-primary': pColor } as React.CSSProperties}
                  >
                    <div className="flex gap-6">
                      {p.theme_config?.imageUrl && (
                        <div className="shrink-0 relative">
                          <img
                            src={p.theme_config.imageUrl}
                            alt={p.title || 'Show'}
                            className="h-24 w-24 rounded-2xl object-cover shadow-2xl ring-2 ring-white/10 group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 rounded-2xl ring-inset ring-1 ring-white/20" />
                        </div>
                      )}
                      <div className="space-y-2 min-w-0">
                        <h4 className="text-2xl font-black tracking-tighter text-white italic group-hover:text-[var(--podcast-item-primary)] transition-colors truncate">
                          {p.title || 'Untitled'}
                        </h4>
                        {p.description && (
                          <p className="text-sm leading-relaxed text-zinc-500 line-clamp-2 font-bold uppercase tracking-tighter opacity-80">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t-2 border-white/5 pt-6 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[var(--podcast-item-primary)] shadow-[0_0_10px_var(--podcast-item-primary)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Project Alpha</span>
                      </div>
                      <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-mono text-zinc-500 border border-white/10">
                        {p.id.slice(0, 8)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
