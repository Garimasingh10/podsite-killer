import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ThemeCustomizer from '@/components/dashboard/ThemeCustomizer';
import BlockReorder from '@/components/dashboard/BlockReorder';
import ThemeEngine, { ThemeConfig } from '@/components/ThemeEngine';
import { ChevronLeft } from 'lucide-react';

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
            <ThemeEngine config={themeConfig} />
            <div className="mx-auto max-w-4xl space-y-12">
                <header className="flex items-center justify-between border-b border-slate-800 pb-8">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-2">
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
                        className="group flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-6 py-2 text-sm font-bold text-slate-200 transition-all hover:border-primary hover:text-primary"
                    >
                        <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        Back to Dashboard
                    </Link>
                </header>

                <section className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Theme Customizer */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
                            <ThemeCustomizer
                                podcastId={podcast.id}
                                imageUrl={themeConfig.imageUrl || undefined}
                                initialConfig={themeConfig}
                            />
                        </div>

                        {/* General Settings */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
                            <h3 className="mb-6 text-xl font-bold text-white">General Information</h3>

                            <div className="mb-8 flex flex-col items-center">
                                {themeConfig.imageUrl ? (
                                    <div className="relative group">
                                        <img
                                            src={themeConfig.imageUrl}
                                            alt={podcast.title || 'Podcast Artwork'}
                                            className="h-40 w-40 rounded-2xl object-cover shadow-2xl border-4 border-slate-800"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                            <span className="text-xs font-bold text-white">Artwork</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-40 w-40 items-center justify-center rounded-2xl border-4 border-dashed border-slate-800 bg-slate-900 text-4xl shadow-inner">
                                        🎙️
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Podcast Title</label>
                                    <input
                                        type="text"
                                        defaultValue={podcast.title || ''}
                                        className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                        </div>
                    </div>

                    <aside className="space-y-8">
                        {/* Block Reorder */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
                            <BlockReorder
                                podcastId={podcast.id}
                                initialLayout={pageLayout}
                            />
                        </div>

                        {/* Danger Zone */}
                        <div className="rounded-2xl border border-red-900/10 bg-red-900/5 p-8 backdrop-blur-sm">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-4">Danger Zone</h3>
                            <p className="text-xs text-red-400/60 mb-6">Permanently remove this podcast and all its data.</p>
                            <button className="w-full rounded-xl border border-red-900/20 bg-red-950/50 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white">
                                Delete Podcast
                            </button>
                        </div>
                    </aside>
                </section>
            </div>
        </main>
    );
}
