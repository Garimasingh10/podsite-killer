// components/blocks/GridBlock.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { useLayout } from '../LayoutContext';

export default function GridBlock({ podcast, episodes }: { podcast: any, episodes: any[] }) {
    const layout = useLayout();
    if (layout === 'substack') {
        return (
            <section className="mb-20">
                <div className="flex items-center gap-4 mb-10">
                    <h3 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-400">Recent Writing & Audio</h3>
                    <div className="h-px flex-1 bg-zinc-100" />
                </div>
                <div className="space-y-12">
                    {episodes.map((ep) => (
                        <Link
                            key={ep.id}
                            href={`/${podcast.id}/episodes/${ep.slug}`}
                            className="group block"
                        >
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                    {new Date(ep.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                </span>
                                <h4 className="text-3xl font-black tracking-tight group-hover:underline underline-offset-4 leading-tight">
                                    {ep.title}
                                </h4>
                                <p className="text-lg text-zinc-500 line-clamp-2 max-w-2xl font-medium">
                                    Listen to the full episode on {podcast.title}. Available now.
                                </p>
                                <div className="mt-4 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-zinc-400">
                                    <span>{ep.youtube_video_id ? 'Video Available' : 'Audio Only'}</span>
                                    <span>•</span>
                                    <span className="text-black group-hover:text-red-500 transition-colors">Listen Now →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        );
    }

    if (layout === 'genz') {
        return (
            <section className="mb-32">
                <h3 className="mb-12 text-6xl font-black italic uppercase tracking-tighter rotate-[-1deg] inline-block bg-yellow-400 px-6 py-2 border-4 border-black">The Vault</h3>
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                    {episodes.map((ep) => (
                        <Link
                            key={ep.id}
                            href={`/${podcast.id}/episodes/${ep.slug}`}
                            className="group relative border-8 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all"
                        >
                            <div className="aspect-video w-full border-4 border-black overflow-hidden mb-6">
                                <img
                                    src={ep.image_url || podcast.image}
                                    alt={ep.title}
                                    className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all scale-105 group-hover:scale-110"
                                />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest block mb-2 bg-black text-white px-2 py-1 inline-block">
                                {new Date(ep.published_at).toLocaleDateString()}
                            </span>
                            <h4 className="text-3xl font-black uppercase italic leading-[0.9] tracking-tighter group-hover:text-yellow-500">
                                {ep.title}
                            </h4>
                        </Link>
                    ))}
                </div>
            </section>
        );
    }

    // Default: Netflix Style
    return (
        <section className="mb-24">
            <h3 className="mb-8 text-xl font-bold uppercase tracking-widest text-zinc-400">Popular on {podcast.title}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-2">
                {episodes.map((ep) => (
                    <Link
                        key={ep.id}
                        href={`/${podcast.id}/episodes/${ep.slug}`}
                        className="group relative aspect-[2/3] overflow-hidden rounded-sm transition-transform duration-300 hover:z-20 hover:scale-125 hover:shadow-2xl"
                    >
                        <img
                            src={ep.image_url || podcast.image}
                            alt={ep.title}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 p-4 flex flex-col justify-end">
                            <h4 className="text-xs font-black leading-tight uppercase italic">{ep.title}</h4>
                            <div className="mt-2 flex items-center gap-1 text-[8px] font-black text-red-600">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                                <span>WATCH NOW</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
