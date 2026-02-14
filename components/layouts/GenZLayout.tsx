'use client';
// components/layouts/GenZLayout.tsx
import React from 'react';
import Link from 'next/link';
import { Menu, X, Share2, Zap } from 'lucide-react';
import { LayoutProvider } from '../LayoutContext';
import PublicSearch from '../PublicSearch';

interface GenZLayoutProps {
    children: React.ReactNode;
    podcast: {
        id: string;
        title: string;
        image?: string;
        description?: string;
    };
}

export default function GenZLayout({ children, podcast }: GenZLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <LayoutProvider value="genz">
            <div className="min-h-screen bg-white text-black font-sans selection:bg-accent">
                {/* Aggressive Brutalist Header */}
                <header className="sticky top-0 z-50 border-b-8 border-black bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                        <div className="flex items-center gap-6">
                            {podcast.image && (
                                <div className="h-16 w-16 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden shrink-0">
                                    <img src={podcast.image} alt={podcast.title} className="h-full w-full object-cover" />
                                </div>
                            )}
                            <Link href={`/${podcast.id}`} className="group relative">
                                <span className="relative text-4xl font-black uppercase italic tracking-tighter leading-none group-hover:text-accent transition-colors">
                                    {podcast.title}
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-6">
                            <nav className="hidden items-center gap-8 md:flex">
                                {['Home', 'Drops', 'About'].map((item) => (
                                    <Link
                                        key={item}
                                        href={item === 'Home' ? `/${podcast.id}` : item === 'Drops' ? `/${podcast.id}/episodes` : `/${podcast.id}#host`}
                                        className="text-xl font-black uppercase italic border-4 border-transparent hover:border-black hover:bg-accent px-4 py-1 shadow-none hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-0 hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200"
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </nav>
                            <div className="hidden md:block transition-transform hover:-translate-y-1 hover:-translate-x-1 active:translate-x-0 active:translate-y-0">
                                <PublicSearch podcastId={podcast.id} />
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="border-4 border-black bg-accent p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all md:hidden"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="fixed inset-0 top-[88px] z-40 bg-white p-8 animate-in slide-in-from-right duration-300 md:hidden border-l-8 border-black">
                            <nav className="flex flex-col gap-8">
                                <Link href={`/${podcast.id}`} onClick={() => setIsMenuOpen(false)} className="text-6xl font-black uppercase italic border-b-8 border-black pb-4">Home</Link>
                                <Link href={`/${podcast.id}/episodes`} onClick={() => setIsMenuOpen(false)} className="text-6xl font-black uppercase italic border-b-8 border-black pb-4">Drops</Link>
                                <Link href={`/${podcast.id}#host`} onClick={() => setIsMenuOpen(false)} className="text-6xl font-black uppercase italic border-b-8 border-black pb-4">About</Link>
                                <div className="mt-8 flex gap-6">
                                    <div className="h-16 w-16 border-4 border-black flex items-center justify-center text-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">𝕏</div>
                                    <div className="h-16 w-16 border-4 border-black flex items-center justify-center text-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">in</div>
                                </div>
                            </nav>
                        </div>
                    )}
                </header>

                {/* Brutalist Main Content */}
                <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8 space-y-32">
                    {children}
                </main>

                {/* Loud Footer */}
                <footer className="border-t-8 border-black bg-accent p-12 lg:p-24">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-xl">
                                <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-8">
                                    STAY<br />FRESH
                                </h2>
                                <p className="text-2xl font-bold uppercase italic tracking-tight">
                                    © {new Date().getFullYear()} {podcast.title}. All rights reserved lol.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button className="border-4 border-black bg-black text-white px-8 py-4 text-xl font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                    Subscribe Now
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </LayoutProvider>
    );
}
