// components/blocks/GridBlock.tsx
import React from 'react';
import Link from 'next/link';

export default function GridBlock({ podcast, episodes }: { podcast: any, episodes: any[] }) {
    return (
        <section className="mb-12">
            <h3 className="mb-6 text-2xl font-bold">Recent Episodes</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {episodes.map((ep) => (
                    <Link
                        key={ep.id}
                        href={`/${podcast.id}/episodes/${ep.slug}`}
                        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                        <div className="aspect-video w-full overflow-hidden bg-secondary">
                            <img
                                src={ep.image_url || podcast.image_url}
                                alt={ep.title}
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                        </div>
                        <div className="p-4">
                            <span className="mb-2 block text-xs font-mono text-muted-foreground">
                                {new Date(ep.published_at).toLocaleDateString()}
                            </span>
                            <h4 className="line-clamp-2 font-bold group-hover:text-primary transition-colors">
                                {ep.title}
                            </h4>
                            {ep.youtube_video_id && (
                                <div className="mt-2 flex items-center gap-1 text-xs font-bold text-red-500">
                                    <span>📹</span> VIDEO AVAILABLE
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
