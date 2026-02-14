'use client';
import React from 'react';
import { useLayout } from '../LayoutContext';

export default function SubscribeBlock({ podcast }: { podcast: any }) {
    const layout = useLayout();
    const platforms = [
        { name: 'Apple Podcasts', icon: '🍎' },
        { name: 'Spotify', icon: '🎧' },
        { name: 'YouTube', icon: '📺' },
        { name: 'RSS Feed', icon: '📡' },
    ];

    if (layout === 'substack') {
        return (
            <section className="mb-24 py-16 border-y border-zinc-100 italic">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-black italic tracking-tighter mb-4">Subscribe to the newsletter</h3>
                    <p className="text-zinc-500 font-medium">Join 50,000+ others and never miss an update.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                    {platforms.map((p) => (
                        <button key={p.name} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                            <span>{p.icon}</span>
                            <span>{p.name}</span>
                        </button>
                    ))}
                </div>
            </section>
        );
    }

    if (layout === 'genz') {
        return (
            <section className="relative mb-32 bg-black p-12 lg:p-20 text-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(var(--accent-rgb),1)] rotate-[-1deg]">
                <h3 className="text-6xl font-black uppercase italic tracking-tighter mb-12 leading-none">JOIN THE FAM</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {platforms.map((p) => (
                        <button key={p.name} className="border-4 border-white bg-white text-black p-6 font-black uppercase italic text-xl shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_rgba(255,255,255,1)] hover:bg-accent transition-all duration-200 active:translate-x-0 active:translate-y-0 active:shadow-none">
                            {p.name}
                        </button>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="mb-24">
            <h3 className="mb-8 text-xl font-bold uppercase tracking-widest text-zinc-400">Where to Watch & Listen</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {platforms.map((p) => (
                    <button
                        key={p.name}
                        className="flex items-center gap-4 rounded-sm bg-zinc-800/40 p-5 font-black uppercase transition-all hover:bg-red-600 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] active:scale-95 group"
                    >
                        <span className="text-2xl group-hover:scale-125 transition-transform">{p.icon}</span>
                        <span className="text-xs tracking-widest text-zinc-300 group-hover:text-white">{p.name}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
