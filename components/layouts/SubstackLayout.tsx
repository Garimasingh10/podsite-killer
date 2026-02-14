'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import PublicSearch from '../PublicSearch';

export default function SubstackLayout({ children, podcast }: { children: React.ReactNode, podcast: any }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#fff] text-[#171717] selection:bg-primary/30">
            <header className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href={`/${podcast.id}`} className="text-xl font-bold">{podcast.title}</Link>
                        <nav className="hidden gap-4 text-sm font-medium sm:flex">
                            <Link href={`/${podcast.id}`} className="text-slate-600 hover:text-black transition-colors">Home</Link>
                            <Link href={`/${podcast.id}/episodes`} className="text-slate-600 hover:text-black transition-colors">Episodes</Link>
                            <Link href={`/${podcast.id}#host`} className="text-slate-600 hover:text-black transition-colors">About</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block">
                            <PublicSearch podcastId={podcast.id} />
                        </div>
                        <button className="hidden sm:block rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                            Subscribe
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-slate-100 sm:hidden transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="border-t border-border bg-white px-4 py-8 animate-in slide-in-from-top-2 sm:hidden">
                        <nav className="flex flex-col gap-6 text-base font-bold">
                            <Link
                                href={`/${podcast.id}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-slate-600 hover:text-black py-2"
                            >
                                Home
                            </Link>
                            <Link
                                href={`/${podcast.id}/episodes`}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-slate-600 hover:text-black py-2"
                            >
                                Episodes
                            </Link>
                            <Link
                                href={`/${podcast.id}#host`}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-slate-600 hover:text-black py-2"
                            >
                                About
                            </Link>
                            <button className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-xl shadow-indigo-500/10 transition-all hover:bg-indigo-500 active:scale-[0.98]">
                                Subscribe Now
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            <main className="mx-auto max-w-2xl px-4 py-16">
                <div className="mb-12 text-center">
                    {podcast.image && (
                        <img
                            src={podcast.image}
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
