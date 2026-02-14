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
                            className="group block border-l-0 hover:border-l-4 border-orange-500 pl-0 hover:pl-6 transition-all duration-300 ease-out"
                        >
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-orange-500 transition-colors">
                                    {new Date(ep.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                </span>
                                <h4 className="text-3xl font-black tracking-tight group-hover:text-zinc-800 leading-tight">
                                    {ep.title}
                                </h4>
                                <p className="text-lg text-zinc-500 line-clamp-2 max-w-2xl font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                    Listen to the full episode on {podcast.title}. Available now.
                                </p>
                                <div className="mt-4 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600 transition-colors">
                                    <span>{ep.youtube_video_id ? 'Video Available' : 'Audio Only'}</span>
                                    <span>•</span>
                                    <span className="text-black group-hover:text-orange-500 transition-colors font-black">Listen Now →</span>
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
                            className="group relative border-8 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[20px_20px_0px_0px_rgba(var(--accent-rgb),1)] hover:-translate-x-2 hover:-translate-y-2 transition-all duration-200 active:translate-x-0 active:translate-y-0 active:shadow-none"
                        >
                            <div className="aspect-video w-full border-4 border-black overflow-hidden mb-6 relative">
                                <div className="absolute inset-0 bg-accent mix-blend-multiply opacity-0 group-hover:opacity-30 transition-opacity z-10" />
                                <img
                                    src={ep.image_url || podcast.image}
                                    alt={ep.title}
                                    className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all scale-100 group-hover:scale-110 duration-500"
                                />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest block mb-2 bg-black text-white px-2 py-1 inline-block group-hover:bg-accent group-hover:text-black transition-colors">
                                {new Date(ep.published_at).toLocaleDateString()}
                            </span>
                            <h4 className="text-4xl font-black uppercase italic leading-[0.85] tracking-tighter group-hover:tracking-normal transition-all duration-300">
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
        <section className="mb-24 px-4 md:px-0">
            <h3 className="mb-6 text-2xl font-black uppercase tracking-tighter text-zinc-100 flex items-center gap-3">
                <span className="h-6 w-1 bg-red-600 rounded-full" />
                Popular on {podcast.title}
            </h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {episodes.map((ep) => (
                    <Link
                        key={ep.id}
                        href={`/${podcast.id}/episodes/${ep.slug}`}
                        className="group relative aspect-video overflow-visible rounded-sm transition-transform duration-500 ease-out hover:z-50 hover:scale-115"
                    >
                        <div className="h-full w-full overflow-hidden rounded-sm ring-1 ring-white/10 shadow-2xl transition-all group-hover:ring-red-600/50">
                            <img
                                src={ep.image_url || podcast.image}
                                alt={ep.title}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>

                        {/* Netflix-style Card Details on Hover */}
                        <div className="absolute inset-x-0 -bottom-2 translate-y-full p-4 opacity-0 transition-all duration-300 group-hover:opacity-100 bg-zinc-900 rounded-b-md border-x border-b border-white/5 shadow-2xl">
                            <h4 className="text-sm font-black leading-tight uppercase tracking-tighter text-white line-clamp-2 italic">{ep.title}</h4>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 animate-pulse">Watch Now</span>
                                <span className="text-[10px] font-bold text-zinc-500">{new Date(ep.published_at).getFullYear()}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
