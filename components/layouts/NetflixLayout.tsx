'use client';
// components/layouts/NetflixLayout.tsx
import React from 'react';
import Link from 'next/link';
import { Menu, Search, Headphones, X, Heart, Twitter, Linkedin } from 'lucide-react';
import PublicSearch from '../PublicSearch';
import { LayoutProvider } from '../LayoutContext';
import { useState, useEffect } from 'react';

interface NetflixLayoutProps {
    children: React.ReactNode;
    podcast: {
        id: string;
        title: string;
        tagline?: string;
        image?: string;
        description?: string;
        latest_video_id?: string;
        twitterUrl?: string;
        linkedInUrl?: string;
    };
    onSubscribeClick?: () => void;
}

export default function NetflixLayout({ children, podcast, onSubscribeClick }: NetflixLayoutProps) {
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
        <LayoutProvider value="netflix">
            <div className="relative min-h-screen bg-black text-white selection:bg-[var(--primary)]/30 overflow-x-hidden">
                {/* Dynamic Background */}
                <div className="fixed inset-0 z-0 mesh-gradient opacity-20 pointer-events-none" />
                <div className="fixed inset-0 z-0 grid-pattern opacity-[0.03] pointer-events-none" />

                {/* Nav Bar */}
                <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black via-black/80 to-transparent px-8 py-4 transition-colors hover:bg-black md:px-16 border-b border-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href={`/${podcast.id}`} className="group flex flex-col py-2">
                                <span className="text-3xl font-black tracking-tighter text-white transition-all group-hover:text-[var(--primary)]">
                                    {podcast.title?.toUpperCase() || 'PODSITE'}
                                </span>
                                {podcast.tagline && (
                                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                                        {podcast.tagline}
                                    </span>
                                )}
                            </Link>
                            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                                <Link href={`/${podcast.id}`} className="text-white hover:text-white/70 transition-colors uppercase">Home</Link>
                                <Link href={`/${podcast.id}/episodes`} className="text-white hover:text-white/70 transition-colors uppercase">Archive</Link>
                                <Link href={`/${podcast.id}#product`} className="text-white hover:text-white/70 transition-colors uppercase">Shop</Link>
                                <Link href={`/${podcast.id}#host`} className="text-white hover:text-white/70 transition-colors uppercase">About</Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-4">
                                <PublicSearch podcastId={podcast.id} />
                                
                                {/* Favorites Heart (Move Socials/Subscribe to footer) */}
                                <button 
                                    onClick={toggleFavorite}
                                    className={`p-2 rounded-full transition-all ${isFavorited ? 'text-red-500 fill-red-500 bg-red-500/10' : 'text-zinc-400 hover:text-white bg-white/5'}`}
                                >
                                    <Heart size={20} />
                                </button>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/10 text-white backdrop-blur-md md:hidden"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Overlay */}
                    {isMenuOpen && (
                        <div className="fixed inset-0 top-16 z-40 flex flex-col items-center justify-center gap-8 bg-black/98 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 md:hidden">
                            <nav className="flex flex-col items-center gap-10 text-3xl font-black">
                                <Link href={`/${podcast.id}`} onClick={() => setIsMenuOpen(false)} className="hover:text-[var(--primary)] transition-all uppercase">Home</Link>
                                <Link href={`/${podcast.id}/episodes`} onClick={() => setIsMenuOpen(false)} className="hover:text-[var(--primary)] transition-all uppercase">Archive</Link>
                                <Link href={`/${podcast.id}#product`} onClick={() => setIsMenuOpen(false)} className="hover:text-[var(--primary)] transition-all uppercase">Shop</Link>
                                <Link href={`/${podcast.id}#host`} onClick={() => setIsMenuOpen(false)} className="hover:text-[var(--primary)] transition-all uppercase">About</Link>
                            </nav>
                        </div>
                    )}
                </header>

                <main className="relative z-10 pt-24 pb-12">
                    {children}
                </main>

                <footer className="relative z-10 border-t border-white/5 bg-black px-8 py-20 md:px-16">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 md:flex-row">
                        <div className="space-y-4 text-center md:text-left">
                            <h2 className="text-4xl font-black tracking-tighter uppercase">{podcast.title}</h2>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-600 italic">© {new Date().getFullYear()} All Rights Reserved</p>
                        </div>
                        
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-4">
                                <a href={podcast.twitterUrl || '#'} className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                                    <span className="text-lg font-black italic">𝕏</span>
                                </a>
                                <a href={podcast.linkedInUrl || '#'} className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                                    <span className="text-base font-black italic">in</span>
                                </a>
                            </div>
                            <button 
                                onClick={onSubscribeClick}
                                className="h-14 px-10 rounded-sm bg-white text-black font-black uppercase tracking-[0.2em] text-sm hover:bg-[var(--primary)] transition-all shadow-2xl active:scale-95"
                            >
                                Subscribe Now
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </LayoutProvider>
    );
}
