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
                            <Link href={`/${podcast.id}`} className="text-3xl font-black tracking-tighter text-primary py-2">
                                NETFLIX
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

                {/* Huge Netflix Hero */}
                <section className="relative h-[90vh] w-full overflow-hidden">
                    {podcast.latest_video_id ? (
                        <div className="absolute inset-0 z-0">
                            <iframe
                                className="h-full w-full object-cover opacity-80"
                                src={`https://www.youtube.com/embed/${podcast.latest_video_id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${podcast.latest_video_id}&showinfo=0&rel=0&iv_load_policy=3&disablekb=1`}
                                allow="autoplay; encrypted-media"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
                        </div>
                    ) : podcast.image && (
                        <div className="absolute inset-0">
                            <img
                                src={podcast.image}
                                alt={podcast.title}
                                className="h-full w-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
                        </div>
                    )}
                    <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-32 md:px-16">
                        <span className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.4em] text-primary">
                            <Headphones size={14} /> NEW EPISODE OUT NOW
                        </span>
                        <h1 className="mb-4 text-6xl font-black tracking-tighter md:text-8xl lg:text-[10rem] leading-[0.85] uppercase italic">
                            {podcast.title}
                        </h1>
                        <p className="max-w-2xl text-xl text-zinc-300 font-medium line-clamp-3">
                            {podcast.description}
                        </p>
                        <div className="mt-10 flex gap-4">
                            <button className="rounded-sm bg-white px-10 py-4 text-lg font-black uppercase tracking-tight text-black transition-transform hover:scale-105 active:scale-95 shadow-2xl">
                                Watch Latest
                            </button>
                            <button className="rounded-sm bg-zinc-600/40 backdrop-blur-md px-10 py-4 text-lg font-black uppercase tracking-tight text-white transition-transform hover:bg-zinc-600/60 active:scale-95">
                                More Info
                            </button>
                        </div>
                    </div>
                </section>

                <main className="relative z-10 -mt-20 px-8 pb-24 md:px-16">
                    {children}
                </main>
            </div>
        </LayoutProvider>
    );
}
