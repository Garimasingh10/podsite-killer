// app/api/cron/rss-sweep/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expected) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createSupabaseServerClient();

  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select('id, rss_url, owner_id');

  if (error || !podcasts) {
    console.error('cron podcast fetch error', error);
    return NextResponse.json({ error: 'Failed to fetch podcasts' }, { status: 500 });
  }

  let triggered = 0;

  for (const podcast of podcasts) {
    if (!podcast.rss_url) continue;

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ingest-rss`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // user is not checked here; ingest route does owner check
      },
      body: JSON.stringify({ podcastId: podcast.id }),
    });

    triggered += 1;
  }

  return NextResponse.json({ ok: true, triggered });
}
