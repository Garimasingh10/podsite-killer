// components/layouts/SubstackLayout.tsx
import React from 'react';
import Link from 'next/link';

export default function SubstackLayout({ children, podcast }: { children: React.ReactNode, podcast: any }) {
    return (
        <div className="min-h-screen bg-[#fff] text-[#171717] selection:bg-primary/30">
            <header className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href={`/${podcast.id}`} className="text-xl font-bold">{podcast.title}</Link>
                        <nav className="hidden gap-4 text-sm font-medium sm:flex">
                            <Link href={`/${podcast.id}`} className="text-slate-600 hover:text-black transition-colors">Home</Link>
                            <Link href={`/${podcast.id}/episodes`} className="text-slate-600 hover:text-black transition-colors">Episodes</Link>
                        </nav>
                    </div>
                    <button className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                        Subscribe
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-16">
                <div className="mb-12 text-center">
                    {podcast.image_url && (
                        <img
                            src={podcast.image_url}
                            alt={podcast.title}
                            className="mx-auto mb-6 h-32 w-32 rounded-lg shadow-xl"
                        />
                    )}
                    <h2 className="mb-4 text-4xl font-serif font-bold tracking-tight">{podcast.title}</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">{podcast.description}</p>
                </div>
                {children}
            </main>
        </div>
    );
}
