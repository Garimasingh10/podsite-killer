import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type PageProps = {
    params: Promise<{ id: string }>;
};

type EpisodeRow = {
    id: string;
    title: string | null;
    published_at: string | null;
    description: string | null;
    audio_url: string | null;
};

export default async function PodcastEpisodesPage({ params }: PageProps) {
    const supabase = await createSupabaseServerClient();
    const { id: podcastId } = await params;
    console.log('Episodes Page Hit:', podcastId);

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect('/login');
    }

    const { data: podcast, error: podcastError } = await supabase
        .from('podcasts')
        .select('id, title')
        .eq('id', podcastId)
        .eq('owner_id', user.id)
        .maybeSingle();

    if (podcastError) console.error('Episodes Page DB Error:', podcastError);
    if (!podcast) console.log('Episodes Page: Podcast NOT FOUND for ID:', podcastId, 'and owner:', user.id);

    if (!podcast || podcastError) {
        return (
            <main className="mx-auto max-w-3xl px-4 py-8">
                <p>Podcast not found.</p>
            </main>
        );
    }

    const { data: episodes, error: episodesError } = await supabase
        .from('episodes')
        .select('*')
        .eq('podcast_id', podcastId)
        .order('published_at', { ascending: false });

    if (episodesError) {
        console.error('Error fetching episodes:', episodesError);
    } else {
        console.log(`Episodes Page: Found ${episodes?.length || 0} episodes`);
    }

    const rows = (episodes as EpisodeRow[]) ?? [];

    return (
        <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
            <header className="flex items-center justify-between border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                        {podcast.title}
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Manage your episodes here.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href={`/podcasts/${podcastId}/settings`}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                        Settings
                    </Link>
                    <Link
                        href="/dashboard"
                        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            {rows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center">
                    <p className="text-slate-500">No episodes yet.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="border-b border-slate-800 bg-slate-900 text-xs uppercase font-semibold text-slate-300">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Published</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {rows.map((episode) => (
                                <tr key={episode.id} className="group hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-200">{episode.title}</div>
                                        {episode.description && (
                                            <div className="mt-1 max-w-md truncate text-xs text-slate-500">{episode.description.replace(/<[^>]*>?/gm, '')}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {episode.published_at ? new Date(episode.published_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {episode.audio_url ? (
                                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">Published</span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-500/20">Draft</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-sky-500 hover:text-sky-400 hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
