'use client';
// components/layouts/SubstackLayout.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Search, Menu, X, Heart, Twitter, Linkedin } from 'lucide-react';
import { LayoutProvider } from '../LayoutContext';
import PublicSearch from '../PublicSearch';
import { useState, useEffect } from 'react';

interface SubstackLayoutProps {
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

export default function SubstackLayout({ children, podcast, onSubscribeClick }: SubstackLayoutProps) {
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
        <LayoutProvider value="substack">
            <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] font-serif selection:bg-[var(--primary)]/30 overflow-x-hidden">
                {/* Subtle Background */}
                <div className="fixed inset-0 z-0 mesh-gradient opacity-10 pointer-events-none" />
                <div className="fixed inset-0 z-0 grid-pattern opacity-[0.02] pointer-events-none" />

                {/* Minimal Header */}
                <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-8">
                            <Link href={`/${podcast.id}`} className="group flex flex-col transition-none">
                                <span className="text-2xl font-black italic tracking-tighter transition-colors duration-200 group-hover:text-[var(--primary)] will-change-[color] text-[var(--foreground)]">
                                    {podcast.title.split(' ').map(word => word[0]).join('')}
                                </span>
                                {podcast.tagline && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        {podcast.tagline}
                                    </span>
                                )}
                            </Link>
                            <nav className="hidden items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 md:flex">
                                <Link href={`/${podcast.id}`} className="hover:text-[var(--primary)] transition-all duration-300 hover:tracking-[0.25em] uppercase">Home</Link>
                                <Link href={`/${podcast.id}/episodes`} className="hover:text-[var(--primary)] transition-all duration-300 hover:tracking-[0.25em] uppercase">Archive</Link>
                                <Link href={`/${podcast.id}#product`} className="hover:text-[var(--primary)] transition-all duration-300 hover:tracking-[0.25em] uppercase">Shop</Link>
                                <Link href={`/${podcast.id}#host`} className="hover:text-[var(--primary)] transition-all duration-300 hover:tracking-[0.25em] uppercase">About</Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-6">
                                <PublicSearch podcastId={podcast.id} />
                                
                                <div className="flex items-center gap-3 border-l border-zinc-100 pl-6">
                                    <button 
                                        onClick={toggleFavorite}
                                        className={`transition-colors ${isFavorited ? 'text-red-500 fill-red-500' : 'text-zinc-400 hover:text-black'}`}
                                    >
                                        <Heart size={18} />
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden text-zinc-900"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="absolute inset-x-0 top-full border-b border-zinc-100 bg-white p-6 animate-in slide-in-from-top-2 duration-200 md:hidden">
                            <nav className="flex flex-col gap-6 text-lg font-bold italic">
                                <Link href={`/${podcast.id}`} onClick={() => setIsMenuOpen(false)} className="uppercase">Home</Link>
                                <Link href={`/${podcast.id}/episodes`} onClick={() => setIsMenuOpen(false)} className="uppercase">Archive</Link>
                                <Link href={`/${podcast.id}#product`} onClick={() => setIsMenuOpen(false)} className="uppercase">Shop</Link>
                                <Link href={`/${podcast.id}#host`} onClick={() => setIsMenuOpen(false)} className="uppercase">About</Link>
                                <button 
                                    onClick={() => { onSubscribeClick?.(); setIsMenuOpen(false); }}
                                    className="mt-4 w-full rounded-full bg-black py-4 text-sm font-black uppercase tracking-widest text-white"
                                >
                                    Subscribe
                                </button>
                            </nav>
                        </div>
                    )}
                </header>

                {/* Content Area */}
                <main className="mx-auto max-w-3xl px-6 py-20 animate-fade-in-up">
                    {/* Simplified Podcast Info for Substack */}
                    <div className="mb-24 text-center">
                        {podcast.image && (
                            <div className="mx-auto mb-8 h-32 w-32 relative rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
                                <Image
                                    src={podcast.image}
                                    alt={podcast.title}
                                    fill
                                    sizes="128px"
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <h1 className="mb-2 text-5xl font-black italic tracking-tighter text-[var(--foreground)]">{podcast.title}</h1>
                        {podcast.tagline && (
                            <p className="mb-6 text-sm font-bold uppercase tracking-[0.3em] text-[var(--primary)]">{podcast.tagline}</p>
                        )}
                        <p className="text-xl text-zinc-500 font-medium leading-relaxed italic opacity-80">{podcast.description}</p>
                    </div>

                    <div className="space-y-16">
                        {children}
                    </div>
                </main>

                {/* Minimal Footer */}
                <footer className="border-t border-zinc-100 py-32 bg-white">
                    <div className="mx-auto max-w-3xl px-6 text-center">
                        <div className="mb-12 flex flex-col items-center gap-8">
                            <div className="flex gap-4">
                                <a href={podcast.twitterUrl || '#'} className="h-12 w-12 rounded-full border border-zinc-100 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
                                    <span className="text-xl font-black italic">𝕏</span>
                                </a>
                                <a href={podcast.linkedInUrl || '#'} className="h-12 w-12 rounded-full border border-zinc-100 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
                                    <span className="text-lg font-black italic">in</span>
                                </a>
                            </div>
                            <button 
                                onClick={onSubscribeClick}
                                className="rounded-full bg-black px-12 py-4 text-sm font-black uppercase tracking-[0.2em] text-white hover:bg-[var(--primary)] transition-all shadow-xl active:scale-95"
                            >
                                Subscribe Now
                            </button>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                            © {new Date().getFullYear()} {podcast.title}.
                        </p>
                    </div>
                </footer>
            </div>
        </LayoutProvider>
    );
}
