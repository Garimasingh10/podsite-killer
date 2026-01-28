// app/(dashboard)/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { NewPodcastForm } from './_components/NewPodcastForm';
import { SearchForm } from './_components/SearchForm';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // layout should already redirect, but keep fallback
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p>Please sign in to view your dashboard.</p>
      </main>
    );
  }

  const q = (searchParams?.q ?? '').trim();

  let queryBuilder = supabase
    .from('podcasts')
    .select('id, title, description, rss_url, youtube_channel_id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (q) {
    queryBuilder = queryBuilder.ilike('title', `%${q}%`);
  }

  const { data: podcasts, error } = await queryBuilder;

  if (error) {
    console.error('dashboard podcasts error', error);
  }

  const rows =
    (podcasts as {
      id: string;
      title: string | null;
      description: string | null;
      rss_url: string | null;
      youtube_channel_id: string | null;
    }[]) ?? [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your podcasts</h1>
          <p className="mt-1 text-xs text-slate-500">
            Import from RSS, connect YouTube, then manage episodes.
          </p>
        </div>
        <NewPodcastForm />
      </header>

      <SearchForm initialQuery={q} />

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">
          No podcasts yet. Import one using the button above.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => (
            <li
              key={p.id}
              className="flex items-start justify-between gap-3 rounded border border-slate-800 bg-slate-900/60 p-3"
            >
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-slate-50">
                  {p.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {p.description}
                </p>
                <p className="mt-1 break-all text-[11px] text-slate-500">
                  RSS: {p.rss_url}
                </p>
              </div>
              <div className="flex flex-col gap-2 text-xs text-sky-400">
                <Link href={`/${p.id}`} className="hover:underline">
                  View site
                </Link>
                <Link
                  href={`/dashboard/podcasts/${p.id}/episodes`}
                  className="hover:underline"
                >
                  Episodes
                </Link>
                <Link
                  href={`/dashboard/podcasts/${p.id}/youtube`}
                  className="hover:underline"
                >
                  YouTube sync
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
