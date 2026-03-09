import { NextResponse } from 'next/server';
import { generateThemeFromImage } from '@/lib/ai/openai';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { image, prompt } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        const themeConfig = await generateThemeFromImage(image, prompt);

        return NextResponse.json({ themeConfig });
    } catch (error: any) {
        console.error('Vision AI Error:', error);
        return NextResponse.json({ 
            error: error.message || 'Failed to generate theme from image' 
        }, { status: 500 });
    }
}
