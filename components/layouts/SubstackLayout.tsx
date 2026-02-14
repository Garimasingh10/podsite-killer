'use client';
// components/layouts/SubstackLayout.tsx
import React from 'react';
import Link from 'next/link';
import { Mail, Search, Menu, X } from 'lucide-react';
import { LayoutProvider } from '../LayoutContext';
import PublicSearch from '../PublicSearch';

interface SubstackLayoutProps {
    children: React.ReactNode;
    podcast: {
        id: string;
        title: string;
        image?: string;
        description?: string;
    };
}

export default function SubstackLayout({ children, podcast }: SubstackLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <LayoutProvider value="substack">
            <div className="min-h-screen bg-[#FFFFFF] text-[#171717] font-serif selection:bg-orange-100">
                {/* Minimal Header */}
                <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-8">
                            <Link href={`/${podcast.id}`} className="text-2xl font-black italic tracking-tighter">
                                {podcast.title.split(' ').map(word => word[0]).join('')}
                            </Link>
                            <nav className="hidden items-center gap-6 text-[13px] font-bold uppercase tracking-widest text-zinc-500 md:flex">
                                <Link href={`/${podcast.id}`} className="hover:text-black transition-colors">Home</Link>
                                <Link href={`/${podcast.id}/episodes`} className="hover:text-black transition-colors">Archive</Link>
                                <Link href={`/${podcast.id}#host`} className="hover:text-black transition-colors">About</Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block">
                                <PublicSearch podcastId={podcast.id} />
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
                                <Link href={`/${podcast.id}`} onClick={() => setIsMenuOpen(false)}>Home</Link>
                                <Link href={`/${podcast.id}/episodes`} onClick={() => setIsMenuOpen(false)}>Archive</Link>
                                <Link href={`/${podcast.id}#host`} onClick={() => setIsMenuOpen(false)}>About</Link>
                                <button className="mt-4 w-full rounded-full bg-black py-4 text-sm font-black uppercase tracking-widest text-white">
                                    Subscribe
                                </button>
                            </nav>
                        </div>
                    )}
                </header>

                {/* Content Area */}
                <main className="mx-auto max-w-3xl px-6 py-20">
                    {/* Simplified Podcast Info for Substack */}
                    <div className="mb-24 text-center">
                        {podcast.image && (
                            <img
                                src={podcast.image}
                                alt={podcast.title}
                                className="mx-auto mb-8 h-32 w-32 rounded-2xl border border-zinc-100 shadow-sm"
                            />
                        )}
                        <h1 className="mb-4 text-5xl font-black italic tracking-tighter">{podcast.title}</h1>
                        <p className="text-xl text-zinc-500 font-medium leading-relaxed italic">{podcast.description}</p>
                    </div>

                    <div className="space-y-16">
                        {children}
                    </div>
                </main>

                {/* Minimal Footer */}
                <footer className="border-t border-zinc-100 py-20">
                    <div className="mx-auto max-w-3xl px-6 text-center">
                        <div className="mb-8 flex justify-center gap-6 grayscale opacity-50">
                            {/* Social Placeholders */}
                            <span className="text-xl">𝕏</span>
                            <span className="text-xl">in</span>
                            <span className="text-xl">📻</span>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
                            © {new Date().getFullYear()} {podcast.title}. Powered by PodSite.
                        </p>
                    </div>
                </footer>
            </div>
        </LayoutProvider>
    );
}
