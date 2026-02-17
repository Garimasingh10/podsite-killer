import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ThemeEngine, { ThemeConfig } from '@/components/ThemeEngine';
import { ChevronLeft } from 'lucide-react';
import SettingsEditor from '@/components/dashboard/SettingsEditor';

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
        .select('id, title, description, rss_url, theme_config, page_layout')
        .eq('id', podcastId)
        .eq('owner_id', user.id)
        .maybeSingle();

    if (podcastError) console.error('Settings Page DB Error:', podcastError);

    if (!podcast || podcastError) {
        return (
            <main className="mx-auto max-w-3xl px-4 py-8">
                <p>Podcast not found.</p>
            </main>
        );
    }

    const themeConfig = (podcast.theme_config as unknown as ThemeConfig) || {};
    const pageLayout = (podcast.page_layout as string[]) || ['hero', 'subscribe', 'grid', 'host', 'shorts'];

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-50">
            <div className="mx-auto max-w-4xl space-y-12">
                <header className="flex items-center justify-between border-b border-slate-800 pb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">
                            Dashboard / Settings
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                            Customize Site
                        </h1>
                        <p className="mt-2 text-lg text-slate-400">
                            Design your podcast brand and homepage structure.
                        </p>
                    </div>
                    <Link
                        href={`/dashboard`}
                        className="group flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-6 py-2 text-sm font-bold text-slate-200 transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    >
                        <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        Back to Dashboard
                    </Link>
                </header>

                <SettingsEditor
                    podcastId={podcast.id}
                    initialConfig={themeConfig}
                    initialLayout={pageLayout}
                    imageUrl={themeConfig.imageUrl || undefined}
                />

                {/* Info Display (Static) */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm max-w-2xl">
                    <h3 className="mb-6 text-xl font-bold text-white">General Information</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Podcast Title</label>
                            <input
                                type="text"
                                defaultValue={podcast.title || ''}
                                className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 opacity-50"
                                disabled
                            />
                            <p className="mt-2 text-xs text-slate-500 italic">This is automatically synced from your RSS feed.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">RSS URL</label>
                            <input
                                type="text"
                                defaultValue={podcast.rss_url || ''}
                                className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 opacity-50"
                                readOnly
                            />
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="rounded-2xl border border-red-900/10 bg-red-900/5 p-8 backdrop-blur-sm max-w-sm">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-4">Danger Zone</h3>
                    <p className="text-xs text-red-400/60 mb-6">Permanently remove this podcast and all its data.</p>
                    <button className="w-full rounded-xl border border-red-900/20 bg-red-950/50 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white">
                        Delete Podcast
                    </button>
                </section>
            </div>
        </main>
    );
}
    );
}
