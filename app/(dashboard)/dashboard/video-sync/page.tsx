import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import VideoSyncClient from './_components/VideoSyncClient';
import { fetchChannelUploads } from '@/lib/youtube/fetchUploads';
import { fuzzyMatchEpisodesToVideos } from '@/lib/youtube/fuzzyMatcher';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function VideoSyncPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: podcasts } = await supabase
        .from('podcasts')
        .select('id, title, youtube_channel_id')
        .eq('owner_id', user.id);

    const activePodcast = podcasts?.[0];

    if (!activePodcast) {
        return (
            <div className="max-w-4xl mx-auto py-8 text-center text-white">
                <p>No active podcast found.</p>
                <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">Return to Dashboard</Link>
            </div>
        );
    }

    if (!activePodcast.youtube_channel_id) {
        return (
            <div className="max-w-4xl mx-auto py-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                    <h2 className="text-xl font-bold text-white mb-2">No YouTube Channel Connected</h2>
                    <p className="text-slate-400 mb-6">Connect a YouTube channel in your dashboard settings to enable video sync.</p>
                    <Link href="/dashboard" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full text-sm font-bold transition-colors">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch episodes that don't have a youtube_video_id linked yet
    const { data: episodes } = await supabase
        .from('episodes')
        .select('id, title, published_at, youtube_video_id')
        .eq('podcast_id', activePodcast.id)
        .is('youtube_video_id', null)
        .order('published_at', { ascending: false });

    // Fetch recent YouTube videos
    const apiKey = process.env.YOUTUBE_API_KEY || ''; // Adjust to available .env variable name
    let videos: any[] = [];
    try {
        if (apiKey) {
            videos = await fetchChannelUploads(apiKey, activePodcast.youtube_channel_id, 50);
        }
    } catch (e) {
        console.error('Failed to fetch videos from YouTube', e);
    }

    const pendingMatches = fuzzyMatchEpisodesToVideos(episodes || [], videos);

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
            <header className="flex items-center justify-between border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Video Sync Engine</h1>
                    <p className="text-slate-400 mt-2">Map your audio episodes to YouTube videos to unlock the Netflix layout.</p>
                </div>
                <Link
                    href={`/dashboard`}
                    className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-6 py-2 text-sm font-bold text-slate-200 transition-all hover:border-primary hover:text-primary"
                >
                    <ChevronLeft size={18} />
                    Dashboard
                </Link>
            </header>

            {!apiKey && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl text-sm font-semibold flex items-center justify-center">
                    Developer Warning: YOUTUBE_API_KEY is not set in environment variables.
                </div>
            )}

            <VideoSyncClient
                matches={pendingMatches}
                unmatchedEpisodes={(episodes || []).filter(ep => !pendingMatches.find(m => m.episodeId === ep.id))}
            />
        </div>
    );
}
