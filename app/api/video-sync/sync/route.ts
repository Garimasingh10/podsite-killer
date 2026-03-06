import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { fetchShorts } from '@/lib/youtube/shorts'; // Existing YouTube logic
import { fuzzyMatchEpisodesToVideos } from '@/lib/youtube/fuzzyMatcher';

export async function POST(req: Request) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { podcastId } = await req.json();

        // 1. Fetch podcast channel ID
        const { data: podcast } = await supabase
            .from('podcasts')
            .select('id, youtube_channel_id, title')
            .eq('id', podcastId)
            .eq('owner_id', user.id)
            .single();

        if (!podcast || !podcast.youtube_channel_id) {
            return NextResponse.json({ error: 'Podcast or YouTube Channel ID not found' }, { status: 404 });
        }

        // 2. Fetch episodes and videos
        const { data: episodes } = await supabase
            .from('episodes')
            .select('id, title, published_at')
            .eq('podcast_id', podcastId);

        // This is where we'd fetch actual YouTube videos
        // For structure-only, we'll mark episodes as 'pending' for matching
        if (episodes && episodes.length > 0) {
            await supabase
                .from('episodes')
                .update({ video_sync_status: 'pending' })
                .eq('podcast_id', podcastId)
                .is('youtube_video_id', null);
        }

        return NextResponse.json({ success: true, message: 'Sync started. AI is matching videos...' });
    } catch (error: any) {
        console.error('Sync Trigger Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
