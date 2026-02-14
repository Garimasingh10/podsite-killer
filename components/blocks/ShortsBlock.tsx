// components/blocks/ShortsBlock.tsx
import React from 'react';
import { fetchChannelUploads } from '@/lib/youtube/fetchUploads';
import { Headphones } from 'lucide-react';

export default async function ShortsBlock({ podcast }: { podcast: any }) {
    const channelId = podcast.youtube_channel_id;

    if (!channelId) {
        return null;
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    let videos: any[] = [];

    if (apiKey) {
        try {
            // Re-use our existing helper which fetches latest 50 uploads
            // We can just take the top 10 for the carousel
            videos = await fetchChannelUploads(apiKey, channelId, 10);
        } catch (e) {
            console.error('Failed to fetch shorts/videos for block', e);
        }
    }

    if (!videos.length) {
        return null;
    }

    return (
        <section className="mb-20 animate-fade-in-up [animation-delay:200ms]">
            <div className="mb-10 flex items-center justify-between px-4 md:px-0">
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Shorts & Clips
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 opacity-80">
                        From our YouTube Channel
                    </p>
                </div>
                <a
                    href={`https://www.youtube.com/channel/${channelId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 shadow-sm transition-all hover:scale-105 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                </a>
            </div>

            <div className="no-scrollbar flex gap-6 overflow-x-auto pb-10 scrollbar-hide snap-x snap-mandatory px-4 md:px-0">
                {videos.map((video) => (
                    <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative h-[420px] w-[240px] flex-shrink-0 cursor-pointer overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 bg-zinc-950 snap-start block shadow-xl transition-all hover:-translate-y-3 hover:shadow-2xl hover:border-indigo-500/50"
                    >
                        <img
                            src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                            }}
                            alt={video.title}
                            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                        {/* Status Badge */}
                        <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/20">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Clip</span>
                        </div>

                        <div className="absolute bottom-8 left-8 right-8 text-white text-left">
                            <p className="font-bold leading-tight line-clamp-2 text-lg tracking-tight mb-3">
                                {video.title}
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="h-1 w-6 bg-indigo-500 rounded-full" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    {new Date(video.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-black/20 backdrop-blur-[2px]">
                            <div className="h-16 w-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
