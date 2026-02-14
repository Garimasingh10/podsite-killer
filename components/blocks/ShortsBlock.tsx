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
        <section className="mb-16 animate-fade-in-up [animation-delay:200ms]">
            <div className="mb-8 flex items-center justify-between px-4 md:px-0">
                <div className="space-y-1">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                        Shorts & Clips
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-80">
                        The latest from YouTube
                    </p>
                </div>
                <a
                    href={`https://www.youtube.com/channel/${channelId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-primary hover:underline"
                >
                    View All
                </a>
            </div>

            <div className="no-scrollbar flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory px-4 md:px-0">
                {videos.map((video) => (
                    <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative h-[400px] w-[225px] flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 border-foreground bg-black snap-start block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:scale-95"
                    >
                        <img
                            src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`} // Attempt maxres for better quality
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                            }}
                            alt={video.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

                        <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-red-600/20 backdrop-blur-md flex items-center justify-center text-red-500 animate-pulse">
                            <Headphones size={14} className="fill-current" />
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                            <p className="font-black leading-tight line-clamp-2 text-sm uppercase italic tracking-tight mb-2">
                                {video.title}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="h-1 w-8 bg-primary rounded-full" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    {new Date(video.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-primary/10">
                            <div className="h-16 w-16 rounded-full bg-white text-black flex items-center justify-center text-2xl shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                🎬
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
