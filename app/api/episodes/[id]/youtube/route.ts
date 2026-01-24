// app/api/episodes/[id]/youtube/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const { youtubeVideoId } = await req.json();

  if (!youtubeVideoId) {
    return NextResponse.json(
      { error: 'youtubeVideoId required' },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from('episodes')
    .update({ youtube_video_id: youtubeVideoId })
    .eq('id', id);

  if (error) {
    console.error('episode youtube update error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
