'use client';
// components/layouts/GenZLayout.tsx
import React from 'react';
import Link from 'next/link';
import { Menu, X, Share2, Zap, Heart, Twitter, Linkedin } from 'lucide-react';
import { LayoutProvider } from '../LayoutContext';
import PublicSearch from '../PublicSearch';
import { useState, useEffect } from 'react';

interface GenZLayoutProps {
    children: React.ReactNode;
    podcast: {
        id: string;
        title: string;
        tagline?: string;
        image?: string;
        description?: string;
        twitterUrl?: string;
        linkedInUrl?: string;
    };
    onSubscribeClick?: () => void;
}

export default function GenZLayout({ children, podcast, onSubscribeClick }: GenZLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('podsite_favorites') || '[]');
        setIsFavorited(favorites.includes(podcast.id));
    }, [podcast.id]);

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('podsite_favorites') || '[]');
        let newFavorites;
        if (favorites.includes(podcast.id)) {
            newFavorites = favorites.filter((id: string) => id !== podcast.id);
            setIsFavorited(false);
        } else {
            newFavorites = [...favorites, podcast.id];
            setIsFavorited(true);
        }
        localStorage.setItem('podsite_favorites', JSON.stringify(newFavorites));
    };

    return (
        <LayoutProvider value="genz">
            <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/30 overflow-x-hidden">
                {/* Dynamic Background */}
                <div className="fixed inset-0 z-0 mesh-gradient opacity-15 pointer-events-none" />
                <div className="fixed inset-0 z-0 grid-pattern opacity-[0.04] pointer-events-none" />

                {/* Aggressive Brutalist Header */}
                <header className="sticky top-0 z-50 border-b-8 border-black bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
                        <div className="flex items-center gap-2">
                            <Link href={`/${podcast.id}`} className="group relative flex flex-col leading-none">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-black uppercase italic tracking-tighter transition-colors group-hover:text-[var(--primary)]">
                                        {podcast.title}
                                    </span>
                                    <span className="text-3xl font-black italic tracking-tighter text-zinc-400">
                                        {">"} TOP STORIES
                                    </span>
                                </div>
                                {podcast.tagline && (
                                    <span className="text-[10px] font-black uppercase italic tracking-widest text-zinc-500 mt-1">
                                        {podcast.tagline}
                                    </span>
                                )}
                            </Link>
                        </div>

                        <div className="flex items-center gap-6">
                            <nav className="hidden items-center gap-8 md:flex">
                                {['HOME', 'ARCHIVE', 'SHOP', 'ABOUT'].map((item) => (
                                    <Link
                                        key={item}
                                        href={item === 'HOME' ? `/${podcast.id}` : item === 'ARCHIVE' ? `/${podcast.id}/episodes` : item === 'SHOP' ? `/${podcast.id}#product` : `/${podcast.id}#host`}
                                        className="text-lg font-black uppercase italic transition-all hover:text-[var(--primary)]"
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </nav>
                            <div className="hidden md:flex items-center gap-4">
                                <PublicSearch podcastId={podcast.id} />
                                
                                {/* Moved to footer */}
                                {/* <button 
                                    onClick={toggleFavorite}
                                    className={`transition-all ${isFavorited ? 'text-red-500 fill-red-500 group' : 'text-zinc-600 hover:text-black'}`}
                                >
                                    <Heart size={28} strokeWidth={3} className={isFavorited ? 'animate-bounce' : ''} />
                                </button>

                                <div className="flex gap-2">
                                    <a href={podcast.twitterUrl || '#'} className="h-10 w-10 border-4 border-black bg-black text-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                        <span className="text-sm font-black italic">𝕏</span>
                                    </a>
                                    <a href={podcast.linkedInUrl || '#'} className="h-10 w-10 border-4 border-black bg-black text-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                        <span className="text-xs font-black italic">in</span>
                                    </a>
                                </div>

                                <button 
                                    onClick={onSubscribeClick}
                                    className="border-4 border-black bg-[var(--primary)] px-6 py-2 text-sm font-black uppercase italic shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                                >
                                    Subscribe
                                </button> */}
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex h-12 w-12 items-center justify-center border-4 border-black md:hidden"
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
                                <Link href={`/${podcast.id}/episodes`} onClick={() => setIsMenuOpen(false)} className="text-6xl font-black uppercase italic border-b-8 border-black pb-4">Archive</Link>
                                <Link href={`/${podcast.id}#product`} onClick={() => setIsMenuOpen(false)} className="text-6xl font-black uppercase italic border-b-8 border-black pb-4">Shop</Link>
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
                <footer className="border-t-8 border-black bg-[var(--primary)] p-12 lg:p-24 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-xl">
                                <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-8">
                                    STAY<br />FRESH
                                </h2>
                                <p className="text-2xl font-bold uppercase italic tracking-tight">
                                    © {new Date().getFullYear()} {podcast.title}. All rights reserved.
                                </p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex gap-3">
                                    <a href={podcast.twitterUrl || '#'} className="h-14 w-14 border-4 border-black bg-black text-white flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                        <span className="text-2xl font-black italic">𝕏</span>
                                    </a>
                                    <a href={podcast.linkedInUrl || '#'} className="h-14 w-14 border-4 border-black bg-black text-white flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                        <span className="text-xl font-black italic">in</span>
                                    </a>
                                </div>
                                <button 
                                    onClick={onSubscribeClick}
                                    className="border-4 border-black bg-black text-white px-12 py-5 text-2xl font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:bg-[var(--primary)] hover:text-black hover:scale-105 active:scale-90 transition-all duration-200"
                                >
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
