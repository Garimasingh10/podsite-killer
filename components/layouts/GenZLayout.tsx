// components/layouts/GenZLayout.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import PublicSearch from '../PublicSearch';
import { Menu, X } from 'lucide-react';

export default function GenZLayout({ children, podcast }: { children: React.ReactNode, podcast: any }) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 selection:bg-primary">
            <header className="relative mb-12 border-8 border-foreground bg-primary p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <h1 className="text-5xl font-black uppercase italic tracking-tighter md:text-9xl leading-none">
                        {podcast.title}
                    </h1>
                    <div className="flex items-center gap-4">
                        <nav className="hidden flex-wrap gap-4 items-center md:flex">
                            <Link href={`/${podcast.id}`} className="border-4 border-black bg-white px-6 py-3 font-black uppercase transition-transform hover:-translate-y-1">Home</Link>
                            <Link href={`/${podcast.id}/episodes`} className="border-4 border-black bg-white px-6 py-3 font-black uppercase transition-transform hover:-translate-y-1">Episodes</Link>
                            <Link href={`/${podcast.id}#host`} className="border-4 border-black bg-white px-6 py-3 font-black uppercase transition-transform hover:-translate-y-1">About</Link>
                            <div className="border-4 border-black bg-white p-1">
                                <PublicSearch podcastId={podcast.id} />
                            </div>
                        </nav>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex h-14 w-14 items-center justify-center border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hidden transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                        >
                            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="mt-8 border-t-8 border-black pt-8 animate-in slide-in-from-top-4 md:hidden">
                        <nav className="flex flex-col gap-6">
                            <Link href={`/${podcast.id}`} onClick={() => setIsMenuOpen(false)} className="border-4 border-black bg-white px-8 py-4 text-2xl font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Home</Link>
                            <Link href={`/${podcast.id}/episodes`} onClick={() => setIsMenuOpen(false)} className="border-4 border-black bg-white px-8 py-4 text-2xl font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Episodes</Link>
                            <Link href={`/${podcast.id}#host`} onClick={() => setIsMenuOpen(false)} className="border-4 border-black bg-white px-8 py-4 text-2xl font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">About</Link>
                            <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <PublicSearch podcastId={podcast.id} />
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <aside className="lg:col-span-1">
                    <div className="border-4 border-foreground bg-accent p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {podcast.image && (
                            <img
                                src={podcast.image}
                                alt={podcast.title}
                                className="mb-4 w-full border-4 border-foreground grayscale contrast-125"
                            />
                        )}
                        <p className="font-bold uppercase tracking-widest">{podcast.description}</p>
                    </div>
                </aside>

                <main className="lg:col-span-2">
                    <div className="border-4 border-foreground bg-background p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
