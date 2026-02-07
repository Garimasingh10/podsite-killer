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
        <section className="mb-12 rounded-2xl border-4 border-foreground bg-accent p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="mb-2 text-3xl font-black uppercase italic">Subscribe Anywhere</h3>
            <p className="mb-6 font-bold">Never miss an episode. Pick your favorite platform:</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {platforms.map((p) => (
                    <button
                        key={p.name}
                        className="flex items-center gap-3 rounded-xl border-2 border-foreground bg-background p-4 font-bold transition-transform hover:-rotate-2 hover:scale-105"
                    >
                        <span className="text-2xl">{p.icon}</span>
                        <span>{p.name}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
