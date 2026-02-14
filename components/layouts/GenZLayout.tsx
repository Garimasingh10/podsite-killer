'use client';
// components/layouts/GenZLayout.tsx
import React from 'react';
import Link from 'next/link';
import { Menu, X, Share2, Zap } from 'lucide-react';
import { LayoutProvider } from '../LayoutContext';

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
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
                        <Link href={`/${podcast.id}`} className="group relative">
                            <div className="absolute -inset-2 bg-accent opacity-0 transition-opacity group-hover:opacity-100" />
                            <span className="relative text-4xl font-black uppercase italic tracking-tighter leading-none">
                                {podcast.title}
                            </span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <nav className="hidden items-center gap-10 md:flex">
                                <Link href={`/${podcast.id}`} className="text-xl font-black uppercase italic hover:bg-black hover:text-white px-2 transition-all">Home</Link>
                                <Link href={`/${podcast.id}/episodes`} className="text-xl font-black uppercase italic hover:bg-black hover:text-white px-2 transition-all">Drops</Link>
                                <Link href={`/${podcast.id}#host`} className="text-xl font-black uppercase italic hover:bg-black hover:text-white px-2 transition-all">About</Link>
                            </nav>
                            <button className="hidden md:block border-4 border-black bg-black text-white px-6 py-2 text-xl font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                Subscribe
                            </button>
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
