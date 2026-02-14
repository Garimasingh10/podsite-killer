// components/blocks/SubscribeBlock.tsx
import React from 'react';

export default function SubscribeBlock({ podcast }: { podcast: any }) {
    // These would ideally come from podcast data
    const platforms = [
        { name: 'Apple Podcasts', icon: '🍎', color: '#872ec4' },
        { name: 'Spotify', icon: '🎧', color: '#1db954' },
        { name: 'YouTube', icon: '📺', color: '#ff0000' },
        { name: 'RSS Feed', icon: '📡', color: '#f26522' },
    ];

    return (
        <section className="group relative mb-12 overflow-hidden rounded-3xl border-4 border-foreground bg-accent p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1">
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-transform group-hover:scale-150" />

            <h3 className="relative mb-2 text-4xl font-black uppercase italic leading-none tracking-tighter">
                Subscribe Anywhere
            </h3>
            <p className="relative mb-8 text-sm font-black uppercase tracking-widest text-foreground/80">
                Never miss an episode. Pick your favorite platform:
            </p>

            <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {platforms.map((p) => (
                    <button
                        key={p.name}
                        className="group/btn flex items-center justify-between gap-3 rounded-2xl border-4 border-foreground bg-background p-5 font-black uppercase transition-all hover:-translate-y-2 hover:bg-white hover:text-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:scale-95"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-3xl filter grayscale group-hover/btn:grayscale-0 transition-all duration-300 transform group-hover/btn:scale-125 group-hover/btn:rotate-12">{p.icon}</span>
                            <span className="text-xs tracking-tight">{p.name}</span>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-foreground opacity-20 group-hover/btn:opacity-100 group-hover/btn:scale-150 transition-all" />
                    </button>
                ))}
            </div>
        </section>
    );
}
