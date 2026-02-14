'use client';
// components/layouts/NetflixLayout.tsx
import React from 'react';
import Link from 'next/link';
import { Menu, Search, Headphones, X } from 'lucide-react';
import PublicSearch from '../PublicSearch';

export default function NetflixLayout({ children, podcast }: { children: React.ReactNode, podcast: any }) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-black text-white dark font-sans">
            {/* Nav Bar */}
            <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/80 to-transparent px-8 py-4 transition-colors hover:bg-black/90 md:px-16">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href={`/${podcast.id}`} className="text-2xl font-black tracking-tighter text-sky-500 py-2">
                            {(podcast.title || 'Podcast').split(' ').map((s: string) => s[0]).join('')}
                        </Link>
                        <Link href={`/${podcast.id}`} className="hover:text-sky-400 py-2 hidden sm:block">Home</Link>
                        <Link href={`/${podcast.id}/episodes`} className="hover:text-sky-400 py-2 hidden sm:block">Episodes</Link>
                        <Link href={`/${podcast.id}#host`} className="hover:text-sky-400 py-2 hidden sm:block">About</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <PublicSearch podcastId={podcast.id} />
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md md:hidden shadow-lg"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 top-16 z-40 flex flex-col items-center justify-center gap-8 bg-black/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 md:hidden">
                        <nav className="flex flex-col items-center gap-10 text-3xl font-black italic uppercase tracking-tighter">
                            <Link
                                href={`/${podcast.id}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="hover:text-sky-400 py-4 transition-all"
                            >
                                Home
                            </Link>
                            <Link
                                href={`/${podcast.id}/episodes`}
                                onClick={() => setIsMenuOpen(false)}
                                className="hover:text-sky-400 py-4 transition-all"
                            >
                                Episodes
                            </Link>
                            <Link
                                href={`/${podcast.id}#host`}
                                onClick={() => setIsMenuOpen(false)}
                                className="hover:text-sky-400 py-4 transition-all"
                            >
                                About
                            </Link>
                        </nav>
                        <div className="h-px w-24 bg-slate-800" />
                        <Link
                            href={`/dashboard`}
                            className="text-sm font-medium text-slate-500 hover:text-white"
                        >
                            Creator Dashboard
                        </Link>
                    </div>
                )}
            </header>

            {/* Netflix Hero */}
            <section className="relative h-[85vh] w-full overflow-hidden">
                {podcast.image && (
                    <div className="absolute inset-0">
                        <img
                            src={podcast.image}
                            alt={podcast.title}
                            className="h-full w-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    </div>
                )}
                <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-16 md:px-16">
                    <span className="mb-2 inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                        {podcast.title} Official Site
                    </span>
                    <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">{podcast.title}</h1>
                    <p className="max-w-2xl text-lg text-muted-foreground line-clamp-3">{podcast.description}</p>
                    <div className="mt-8 flex gap-4">
                        <button className="rounded-md bg-primary px-8 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105 shadow-lg shadow-primary/20">
                            Start Listening
                        </button>
                    </div>
                </div>
            </section>

            <main className="px-8 py-12 md:px-16">
                {children}
            </main>
        </div>
    );
}
