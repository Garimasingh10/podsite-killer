'use client';
import React from 'react';
import Link from 'next/link';
import { useLayout } from '../LayoutContext';

export default function HeroBlock({ podcast, latestEpisode }: { podcast: any, latestEpisode: any }) {
    const layout = useLayout();
    if (layout === 'substack') {
        return (
            <section className="relative mb-24 py-12 border-b border-zinc-100">
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-6">Featured This Week</span>
                    <h2 className="text-5xl font-black italic tracking-tighter leading-none mb-8">
                        {latestEpisode?.title || podcast.title}
                    </h2>
                    <p className="text-xl text-zinc-500 font-medium leading-relaxed italic mb-10">
                        {latestEpisode?.description?.slice(0, 180) || podcast.description || ''}...
                    </p>
                    <Link
                        href={`/${podcast.id}/episodes/${latestEpisode?.slug}`}
                        className="bg-black text-white px-12 py-4 text-sm font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                    >
                        Listen & Read Post
                    </Link>
                </div>
            </section>
        );
    }

    if (layout === 'genz') {
        return (
            <section className="relative mb-32 group">
                <div className="absolute -inset-4 bg-accent rotate-1 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" />
                <div className="relative border-8 border-black bg-white p-12 md:p-20 z-10 flex flex-col md:flex-row gap-12 items-center">
                    {podcast.image && (
                        <div className="shrink-0 rotate-[-3deg] border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                            <img
                                src={podcast.image}
                                alt={podcast.title}
                                className="h-64 w-64 object-cover"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <span className="bg-black text-white font-black uppercase tracking-widest px-4 py-1 text-sm inline-block mb-6">
                            Fresh Drop
                        </span>
                        <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8">
                            {latestEpisode?.title || podcast.title}
                        </h2>
                        <div className="flex flex-wrap gap-6">
                            <Link
                                href={`/${podcast.id}/episodes/${latestEpisode?.slug}`}
                                className="bg-accent border-8 border-black px-12 py-4 text-2xl font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                            >
                                Play Now
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
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-1 bg-primary" />
                    <span className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400">Episode Info</span>
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic md:text-6xl leading-none">
                    {latestEpisode?.title || podcast.title}
                </h2>
                <p className="max-w-2xl text-lg text-zinc-400 font-medium">
                    {latestEpisode?.description?.slice(0, 200) || podcast.description || ''}...
                </p>
                <div className="flex gap-4">
                    <Link
                        href={`/${podcast.id}/episodes/${latestEpisode?.slug}`}
                        className="flex items-center gap-2 rounded-sm bg-white px-8 py-3 font-black uppercase text-black hover:bg-white/90"
                    >
                        <span>▶</span>
                        <span>Play</span>
                    </Link>
                    <button className="rounded-sm bg-zinc-600/40 backdrop-blur-md px-8 py-3 font-black uppercase text-white hover:bg-zinc-600/60">
                        Details
                    </button>
                </div>
            </div>
        </section>
    );
}
