'use client';
import React from 'react';
import Link from 'next/link';
import { useLayout } from '../LayoutContext';

export default function HeroBlock({ podcast, latestEpisode }: { podcast: any, latestEpisode: any }) {
    const layout = useLayout();
    const isNetflix = layout === 'netflix';

    if (isNetflix) {
        return (
            <section className="relative h-[95vh] w-full overflow-hidden bg-black">
                {/* Immersive Background */}
                <div className="absolute inset-0 z-0">
                    {podcast.latest_video_id ? (
                        <iframe
                            className="h-full w-full scale-110 object-cover opacity-60 brightness-[0.4]"
                            src={`https://www.youtube.com/embed/${podcast.latest_video_id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${podcast.latest_video_id}&showinfo=0&rel=0`}
                            allow="autoplay"
                        />
                    ) : (
                        <div className="h-full w-full bg-zinc-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>

                {/* Structured Content Container */}
                <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-24 md:px-16 lg:pb-32">
                    <div className="space-y-6">
                        {/* Podcast Branding (Secondary Title) */}
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-black uppercase tracking-[0.3em] text-zinc-400 opacity-80">
                                {podcast.title}
                            </span>
                        </div>

                        {/* Main Episode Title (Primary) */}
                        <h1 className="max-w-5xl text-6xl font-black tracking-tighter text-white uppercase italic md:text-8xl lg:text-9xl leading-[0.85] drop-shadow-2xl">
                            {latestEpisode?.title || 'Welcome'}
                        </h1>

                        <p className="max-w-2xl text-lg font-medium text-zinc-300 drop-shadow-md md:text-xl line-clamp-3">
                            {latestEpisode?.description?.replace(/<[^>]*>?/gm, '') || podcast.description || ''}
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4 pt-4">
                            <Link
                                href={latestEpisode ? `/${podcast.id}/episodes/${latestEpisode.slug}` : `/${podcast.id}/episodes`}
                                className="group flex items-center gap-3 rounded-md bg-white px-10 py-4 text-lg font-black uppercase tracking-tighter text-black transition-all hover:bg-white/90 active:scale-95"
                            >
                                <span className="transition-transform group-hover:scale-125">▶</span> Watch Now
                            </Link>
                            <button className="flex items-center gap-3 rounded-md bg-zinc-600/40 px-10 py-4 text-lg font-black uppercase tracking-tighter text-white backdrop-blur-md transition-all hover:bg-zinc-600/60 active:scale-95">
                                More Info
                            </button>
                        </div>
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
                {/* Main Skewed Container */}
                <div className="relative border-x-8 border-b-8 border-black bg-white p-12 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    {/* Pink/Red Top Border Accent */}
                    <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-pink-500 to-red-600" />

                    <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                        {/* Image Box on Left */}
                        <div className="w-full md:w-1/2 shrink-0">
                            <div className="aspect-square border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white group-hover:shadow-none group-hover:translate-x-2 group-hover:translate-y-2 transition-all">
                                <img
                                    src={latestEpisode?.image_url || podcast.image}
                                    alt={latestEpisode?.title}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <span className="bg-black text-white px-4 py-1 text-sm font-black uppercase tracking-widest">
                                    {latestEpisode?.published_at ? new Date(latestEpisode.published_at).toLocaleDateString() : 'LATEST DROP'}
                                </span>
                            </div>

                            <h2 className="text-6xl font-black uppercase italic tracking-tighter md:text-8xl leading-[0.8] mb-4">
                                {latestEpisode?.title || podcast.title}
                            </h2>

                            <p className="text-xl font-bold leading-tight max-w-xl text-zinc-800">
                                {latestEpisode?.description?.replace(/<[^>]*>?/gm, '').slice(0, 180)}...
                            </p>

                            <div className="flex flex-wrap gap-6 pt-6">
                                <Link
                                    href={`/${podcast.id}/episodes/${latestEpisode?.slug}`}
                                    className="group/btn relative inline-block bg-black text-white px-12 py-5 text-2xl font-black uppercase italic tracking-tighter hover:bg-accent hover:text-black transition-colors"
                                >
                                    <span className="relative z-10 transition-transform group-hover/btn:scale-110">TAP IN</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Skewed Background Element */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-zinc-50 -skew-x-12 translate-x-1/2 z-0" />
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
