// components/layouts/GenZLayout.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    podcast: {
        id: string;
        title: string;
        image?: string;
        description?: string;
    };
}

const GenZLayout: React.FC<LayoutProps> = ({ podcast, children }) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary/30">
            {/* High-Energy Header */}
            <header className="sticky top-0 z-50 border-b-4 border-white/5 bg-black/80 backdrop-blur-xl">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
                    <Link href={`/${podcast.id}`} className="group flex items-center gap-4">
                        {podcast.image && (
                            <img
                                src={podcast.image}
                                alt=""
                                className="h-12 w-12 rounded-xl object-cover ring-2 ring-primary/20 transition-transform group-hover:rotate-6 group-hover:scale-110"
                            />
                        )}
                        <span className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                            {podcast.title}
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:items-center md:gap-10">
                        {['Episodes', 'Watch', 'About'].map((item) => (
                            <Link
                                key={item}
                                href={`/${podcast.id}${item === 'Episodes' ? '/episodes' : item === 'About' ? '/about' : ''}`}
                                className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 transition-all hover:text-primary hover:tracking-[0.3em] italic"
                            >
                                {item}
                            </Link>
                        ))}
                        <Link
                            href="#subscribe"
                            className="rounded-full bg-primary px-8 py-3 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 hover:shadow-primary/20 active:scale-95 transition-all"
                        >
                            Subscribe
                        </Link>
                    </div>

                    {/* Mobile Button - 44px+ touch target */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white md:hidden hover:bg-white/10"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </nav>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="absolute inset-x-0 top-full animate-in slide-in-from-top duration-300 border-b-4 border-white/5 bg-black p-8 md:hidden">
                        <div className="flex flex-col gap-8">
                            {['Episodes', 'Watch', 'About'].map((item) => (
                                <Link
                                    key={item}
                                    href={`/${podcast.id}${item === 'Episodes' ? '/episodes' : item === 'About' ? '/about' : ''}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-4xl font-black italic tracking-tighter uppercase text-white hover:text-primary"
                                >
                                    {item}
                                </Link>
                            ))}
                            <Link
                                href="#subscribe"
                                onClick={() => setIsMenuOpen(false)}
                                className="mt-4 rounded-2xl bg-primary py-5 text-center text-xl font-black uppercase italic text-black"
                            >
                                Subscribe
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                {children}
            </main>

            {/* Hyper-Footer */}
            <footer className="mt-32 border-t-4 border-white/5 bg-black py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-12 text-center">
                        <span className="text-6xl font-black italic tracking-tighter uppercase opacity-10">
                            {podcast.title}
                        </span>
                        <p className="max-w-md text-zinc-500 font-bold uppercase tracking-widest text-xs">
                            © 2026. Built with Podsite. Re-imagining the audio universe.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default GenZLayout;
