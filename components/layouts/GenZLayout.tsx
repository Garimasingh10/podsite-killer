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
            <header className="relative mb-16 rounded-[2.5rem] bg-indigo-600 dark:bg-zinc-900 px-8 py-10 shadow-2xl overflow-hidden">
                <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl opacity-50" />
                <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-4xl font-bold tracking-tight text-white md:text-7xl leading-tight">
                        {podcast.title}
                    </h1>
                    <div className="flex items-center gap-4">
                        <nav className="hidden flex-wrap gap-4 items-center md:flex">
                            <Link href={`/${podcast.id}`} className="rounded-full bg-white/10 backdrop-blur-md px-6 py-2.5 font-bold text-white transition-all hover:bg-white/20">Home</Link>
                            <Link href={`/${podcast.id}/episodes`} className="rounded-full bg-white/10 backdrop-blur-md px-6 py-2.5 font-bold text-white transition-all hover:bg-white/20">Episodes</Link>
                            <Link href={`/${podcast.id}#host`} className="rounded-full bg-white/10 backdrop-blur-md px-6 py-2.5 font-bold text-white transition-all hover:bg-white/20">About</Link>
                            <div className="rounded-full bg-white/10 backdrop-blur-md p-1">
                                <PublicSearch podcastId={podcast.id} />
                            </div>
                        </nav>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md md:hidden transition-all hover:bg-white/20"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="relative mt-10 border-t border-white/10 pt-10 animate-in slide-in-from-top-4 md:hidden">
                        <nav className="flex flex-col gap-4">
                            <Link href={`/${podcast.id}`} onClick={() => setIsMenuOpen(false)} className="rounded-2xl bg-white/10 p-5 text-xl font-bold text-white transition-all">Home</Link>
                            <Link href={`/${podcast.id}/episodes`} onClick={() => setIsMenuOpen(false)} className="rounded-2xl bg-white/10 p-5 text-xl font-bold text-white transition-all">Episodes</Link>
                            <Link href={`/${podcast.id}#host`} onClick={() => setIsMenuOpen(false)} className="rounded-2xl bg-white/10 p-5 text-xl font-bold text-white transition-all">About</Link>
                            <div className="rounded-2xl bg-white/10 p-4">
                                <PublicSearch podcastId={podcast.id} />
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                <aside className="lg:col-span-1">
                    <div className="rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                        {podcast.image && (
                            <img
                                src={podcast.image}
                                alt={podcast.title}
                                className="mb-6 w-full rounded-2xl shadow-xl"
                            />
                        )}
                        <p className="text-lg font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">{podcast.description}</p>
                    </div>
                </aside>

                <main className="lg:col-span-2">
                    <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
