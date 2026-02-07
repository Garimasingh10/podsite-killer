// components/layouts/NetflixLayout.tsx
import React from 'react';
import Link from 'next/link';
import { Menu, Search, Headphones } from 'lucide-react';

export default function NetflixLayout({ children, podcast }: { children: React.ReactNode, podcast: any }) {
    return (
        <div className="min-h-screen bg-black text-white dark font-sans">
            {/* Nav Bar */}
            <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/80 to-transparent px-8 py-4 transition-colors hover:bg-black/90 md:px-16">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href={`/${podcast.id}`} className="text-2xl font-black tracking-tighter text-sky-500">
                            {podcast.title.split(' ').map((s: string) => s[0]).join('')}
                        </Link>
                        <nav className="hidden gap-6 text-sm font-medium md:flex">
                            <Link href={`/${podcast.id}`} className="hover:text-sky-400">Home</Link>
                            <Link href={`/${podcast.id}/episodes`} className="hover:text-sky-400">Episodes</Link>
                            <Link href="#" className="hover:text-sky-400">About</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <Search size={20} className="hidden md:block" />
                        <button className="flex h-8 w-8 items-center justify-center rounded-md md:hidden">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Netflix Hero */}
            <section className="relative h-[85vh] w-full overflow-hidden">
                {podcast.image_url && (
                    <div className="absolute inset-0">
                        <img
                            src={podcast.image_url}
                            alt={podcast.title}
                            className="h-full w-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    </div>
                )}
                <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-16 md:px-16">
                    <span className="mb-2 inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                        {podcast.title} Official Site
                    </span>
                    <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">{podcast.title}</h1>
                    <p className="max-w-2xl text-lg text-muted-foreground line-clamp-3">{podcast.description}</p>
                    <div className="mt-8 flex gap-4">
                        <button className="rounded-md bg-primary px-8 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105 shadow-lg shadow-primary/20">
                            Start Listening
                        </button>
                    </div>
                </div>
            </section>

            <main className="px-8 py-12 md:px-16">
                {children}
            </main>
        </div>
    );
}
