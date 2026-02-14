'use client';
// components/layouts/NetflixLayout.tsx
import React from 'react';
import Link from 'next/link';
import { Menu, Search, Headphones, X } from 'lucide-react';
import PublicSearch from '../PublicSearch';
import { LayoutProvider } from '../LayoutContext';

interface NetflixLayoutProps {
    children: React.ReactNode;
    podcast: {
        id: string;
        title: string;
        image?: string;
        description?: string;
        latest_video_id?: string;
    };
}

export default function NetflixLayout({ children, podcast }: NetflixLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <LayoutProvider value="netflix">
            <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-red-600/30">
                {/* Nav Bar */}
                <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black via-black/40 to-transparent px-8 py-4 transition-colors hover:bg-black md:px-16">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href={`/${podcast.id}`} className="text-3xl font-black tracking-tighter text-white py-2">
                                {podcast.title?.toUpperCase() || 'PODSITE'}
                            </Link>
                            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                                <Link href={`/${podcast.id}`} className="text-white hover:text-white/70 transition-colors">Home</Link>
                                <Link href={`/${podcast.id}/episodes`} className="text-white hover:text-white/70 transition-colors">Episodes</Link>
                                <Link href={`/${podcast.id}#host`} className="text-white hover:text-white/70 transition-colors">About</Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block">
                                <PublicSearch podcastId={podcast.id} />
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
                                <Link href={`/${podcast.id}`} onClick={() => setIsMenuOpen(false)} className="hover:text-red-600 transition-all">Home</Link>
                                <Link href={`/${podcast.id}/episodes`} onClick={() => setIsMenuOpen(false)} className="hover:text-red-600 transition-all">Episodes</Link>
                                <Link href={`/${podcast.id}#host`} onClick={() => setIsMenuOpen(false)} className="hover:text-red-600 transition-all">About</Link>
                            </nav>
                        </div>
                    )}
                </header>

                <main className="relative z-10 px-8 pb-24 md:px-16">
                    {children}
                </main>
            </div>
        </LayoutProvider>
    );
}
