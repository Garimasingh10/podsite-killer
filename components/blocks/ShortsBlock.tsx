// components/blocks/ShortsBlock.tsx
import React from 'react';
import { fetchChannelUploads } from '@/lib/youtube/fetchUploads';

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
        <section className="mb-12">
            <div className="mb-6 flex items-center justify-between px-4">
                <h3 className="text-2xl font-bold">Latest Videos</h3>
                <a
                    href={`https://www.youtube.com/channel/${channelId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-primary hover:underline"
                >
                    View All
                </a>
            </div>

            <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-4">
                {videos.map((video) => (
                    <a
                        key={video.id}
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative h-[300px] w-[225px] flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-border snap-start block"
                    >
                        <img
                            src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                            alt={video.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                            <p className="font-bold line-clamp-3 text-sm">{video.title}</p>
                            <span className="mt-1 block text-xs opacity-70">
                                {new Date(video.publishedAt).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
                                ▶️
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
