import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function PodcastSettingsPage({ params }: PageProps) {
    const supabase = await createSupabaseServerClient();
    const { id: podcastId } = await params;

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect('/login');
    }

    const { data: podcast, error: podcastError } = await supabase
        .from('podcasts')
        .select('id, title, description, rss_url')
        .eq('id', podcastId)
        .eq('owner_id', user.id)
        .maybeSingle();

    if (podcastError) console.error('Settings Page DB Error:', podcastError);
    if (!podcast) console.log('Settings Page: Podcast NOT FOUND for ID:', podcastId, 'and owner:', user.id);

    if (!podcast || podcastError) {
        return (
            <main className="mx-auto max-w-3xl px-4 py-8">
                <p>Podcast not found.</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
            <header className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        Settings
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Update your podcast details.
                    </p>
                </div>
                <Link
                    href={`/podcasts/${podcastId}/episodes`}
                    className="text-sm font-medium text-sky-500 hover:underline"
                >
                    ← Back to Episodes
                </Link>
            </header>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-lg font-medium text-slate-200">General Settings</h3>
                <div className="mt-4 grid gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Podcast Title</label>
                        <input
                            type="text"
                            defaultValue={podcast.title || ''}
                            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
                            disabled
                        />
                        <p className="mt-1 text-xs text-slate-500">Syncs from RSS feed.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400">RSS Feed URL</label>
                        <input
                            type="text"
                            defaultValue={podcast.rss_url || ''}
                            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
                            readOnly
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-red-900/20 bg-red-900/5 p-6">
                <h3 className="text-lg font-medium text-red-500">Danger Zone</h3>
                <p className="mt-1 text-sm text-red-400/60">Once you delete a podcast, there is no going back. Please be certain.</p>

                <div className="mt-4">
                    <button className="rounded-md bg-red-600/10 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-600/20 ring-1 ring-inset ring-red-600/20 transition-all">
                        Delete Podcast
                    </button>
                </div>
            </div>

        </main>
    );
}
