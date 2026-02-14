// components/blocks/HeroBlock.tsx
import React from 'react';
import Link from 'next/link';

export default function HeroBlock({ podcast, latestEpisode }: { podcast: any, latestEpisode: any }) {
    return (
        <section className="relative mb-12 overflow-hidden rounded-2xl border border-border bg-secondary/30 p-8 md:p-12">
            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center">
                {podcast.image && (
                    <div className="shrink-0">
                        <img
                            src={podcast.image}
                            alt={podcast.title}
                            className="h-48 w-48 rounded-xl object-cover shadow-2xl md:h-64 md:w-64"
                        />
                    </div>
                )}
                <div className="flex flex-col justify-center">
                    <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest text-primary">
                        {latestEpisode ? 'Latest Episode' : podcast.title}
                    </span>
                    <h2 className="mb-4 text-3xl font-bold md:text-5xl">
                        {latestEpisode?.title || podcast.title}
                    </h2>
                    <p className="mb-8 max-w-xl text-lg text-muted-foreground leading-relaxed">
                        {latestEpisode?.description?.slice(0, 160) || podcast.description || ''}...
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {latestEpisode?.slug ? (
                            <Link
                                href={`/${podcast.id}/episodes/${latestEpisode.slug}`}
                                className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105"
                            >
                                Listen Now
                            </Link>
                        ) : (
                            <button className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105">
                                Listen to Trailer
                            </button>
                        )}
                        {latestEpisode?.youtube_video_id && (
                            <a
                                href={`https://www.youtube.com/watch?v=${latestEpisode.youtube_video_id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full bg-[#FF0000] px-8 py-3 font-semibold text-white transition-transform hover:scale-105 flex items-center gap-2"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </svg>
                                Watch Video
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
