// app/api/og/[id]/route.tsx
import { ImageResponse } from 'next/og';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export const runtime = 'edge';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const episodeTitle = searchParams.get('title');

    const supabase = await createSupabaseServerClient();

    const { data: podcast } = await supabase
        .from('podcasts')
        .select('title, theme_config')
        .eq('id', id)
        .maybeSingle();

    if (!podcast) {
        return new Response('Podcast not found', { status: 404 });
    }

    // Extract image from theme_config
    const themeConfig = (podcast.theme_config as any) || {};
    const podcastImage = themeConfig.imageUrl || null;

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    backgroundImage: 'radial-gradient(circle at top right, #38bdf8 0%, transparent 40%), radial-gradient(circle at bottom left, #0ea5e9 0%, transparent 40%)',
                    padding: '80px',
                }}
            >
                <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                    {podcastImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={podcastImage}
                            alt={podcast.title}
                            style={{
                                width: '300px',
                                height: '300px',
                                borderRadius: '40px',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            }}
                        />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '20px' }}>
                            PodSite‑Killer
                        </div>
                        <div style={{ fontSize: '64px', fontWeight: 'black', color: 'white', lineHeight: '1.1', marginBottom: '20px' }}>
                            {episodeTitle || podcast.title}
                        </div>
                        {episodeTitle && (
                            <div style={{ fontSize: '32px', color: '#94a3b8' }}>
                                {podcast.title}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
