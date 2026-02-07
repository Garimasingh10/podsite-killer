// components/layouts/GenZLayout.tsx
import React from 'react';
import Link from 'next/link';

export default function GenZLayout({ children, podcast }: { children: React.ReactNode, podcast: any }) {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <header className="mb-12 border-8 border-foreground bg-primary p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <h1 className="text-6xl font-black uppercase italic tracking-tighter md:text-9xl">
                        {podcast.title}
                    </h1>
                    <nav className="flex gap-4">
                        <Link href={`/${podcast.id}`} className="border-4 border-black bg-white px-4 py-1 font-black uppercase transition-transform hover:-translate-y-1">Home</Link>
                        <Link href={`/${podcast.id}/episodes`} className="border-4 border-black bg-white px-4 py-1 font-black uppercase transition-transform hover:-translate-y-1">Episodes</Link>
                    </nav>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <aside className="lg:col-span-1">
                    <div className="border-4 border-foreground bg-accent p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {podcast.image_url && (
                            <img
                                src={podcast.image_url}
                                alt={podcast.title}
                                className="mb-4 w-full border-4 border-foreground grayscale contrast-125"
                            />
                        )}
                        <p className="font-bold uppercase tracking-widest">{podcast.description}</p>
                    </div>
                </aside>

                <main className="lg:col-span-2">
                    <div className="border-4 border-foreground bg-background p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
