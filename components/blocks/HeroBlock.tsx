'use client';
import React from 'react';
import Link from 'next/link';
import { useLayout } from '../LayoutContext';

export default function HeroBlock({ podcast, latestEpisode }: { podcast: any, latestEpisode: any }) {
    const layout = useLayout();
    const isNetflix = layout === 'netflix';

    if (isNetflix) {
        return (
            <section className="relative h-[95vh] w-full overflow-hidden -mt-[88px]">
                <div className="absolute inset-0 z-0 bg-black">
                    {podcast.latest_video_id ? (
                        <iframe
                            className="h-full w-full scale-150 object-cover opacity-60 brightness-[0.4]"
                            src={`https://www.youtube.com/embed/${podcast.latest_video_id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${podcast.latest_video_id}&showinfo=0`}
                            allow="autoplay"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-tr from-black via-zinc-900 to-zinc-800 opacity-20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/20 to-transparent" />
                </div>

                <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-24 md:px-16 lg:pb-32">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-1.5 rounded-sm bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter">
                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                            Exclusive
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Premium Series</span>
                    </div>
                    <h1 className="max-w-4xl text-6xl font-black tracking-tighter text-white uppercase italic md:text-8xl lg:text-9xl leading-[0.8] drop-shadow-2xl">
                        {latestEpisode?.title || podcast.title}
                    </h1>
                    <p className="mt-8 max-w-2xl text-lg font-medium text-zinc-300 drop-shadow-md md:text-xl">
                        {latestEpisode?.description?.slice(0, 200) || podcast.description || ''}...
                    </p>
                    <div className="mt-10 flex flex-wrap gap-4">
                        <Link
                            href={latestEpisode ? `/${podcast.id}/episodes/${latestEpisode.slug}` : `/${podcast.id}/episodes`}
                            className="group flex items-center gap-3 rounded-md bg-white px-10 py-4 text-lg font-black uppercase tracking-tighter text-black transition-all hover:bg-white/90 active:scale-95"
                        >
                            <span className="transition-transform group-hover:scale-125">▶</span> Play Now
                        </Link>
                        <button className="flex items-center gap-3 rounded-md bg-zinc-600/40 px-10 py-4 text-lg font-black uppercase tracking-tighter text-white backdrop-blur-md transition-all hover:bg-zinc-600/60 active:scale-95">
                            More Info
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (layout === 'substack') {
        return (
            <section className="relative mb-24 py-12 border-b border-zinc-100">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        {latestEpisode?.image_url && (
                            <div className="w-full md:w-1/3">
                                <img
                                    src={latestEpisode.image_url}
                                    alt={latestEpisode.title || ''}
                                    className="w-full aspect-square object-cover rounded shadow-xl"
                                />
                            </div>
                        )}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-4xl font-serif font-black tracking-tight text-[#171717] md:text-5xl leading-tight">
                                {latestEpisode?.title}
                            </h2>
                            <p className="mt-6 text-xl text-zinc-600 leading-relaxed font-serif">
                                {latestEpisode?.description?.replace(/<[^>]*>?/gm, '').slice(0, 200)}...
                            </p>
                            <div className="mt-10 flex flex-wrap gap-4 justify-center md:justify-start">
                                <Link
                                    href={`/${podcast.id}/episodes/${latestEpisode?.slug}`}
                                    className="px-8 py-3 bg-[#171717] text-white font-serif font-bold rounded hover:bg-black transition-all"
                                >
                                    Read and Listen
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (layout === 'genz') {
        return (
            <section className="relative mb-32 group">
                <div className="border-8 border-black bg-white p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                            <span className="bg-accent px-4 py-1 text-sm font-black uppercase tracking-widest border-4 border-black">New Drop</span>
                            <span className="font-black uppercase tracking-tighter italic">No. {latestEpisode?.id?.slice(0, 4)}</span>
                        </div>
                        <h2 className="text-6xl font-black uppercase italic tracking-tighter md:text-8xl leading-[0.85]">
                            {latestEpisode?.title}
                        </h2>
                        <p className="text-2xl font-black leading-tight max-w-2xl">
                            {latestEpisode?.description?.replace(/<[^>]*>?/gm, '').slice(0, 150)}
                        </p>
                        <div className="flex flex-wrap gap-6 pt-4">
                            <Link
                                href={`/${podcast.id}/episodes/${latestEpisode?.slug}`}
                                className="bg-black text-white px-12 py-5 text-2xl font-black uppercase italic tracking-tighter hover:bg-accent hover:text-black transition-colors"
                            >
                                Tap In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Default: Netflix Style (more of an info card since Layout has the big video)
    return (
        <section className="relative mb-24 max-w-4xl">
            {/* Minimal fallback or nothing as Netflix Layout renders the hero */}
        </section>
    );
}
