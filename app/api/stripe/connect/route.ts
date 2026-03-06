import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2023-10-16' as any,
    });
    
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { podcastId } = await req.json();

        // 1. Get podcast
        const { data: podcast } = await supabase
            .from('podcasts')
            .select('id, stripe_account_id')
            .eq('id', podcastId)
            .eq('owner_id', user.id)
            .single();

        if (!podcast) {
            return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
        }

        let accountId = podcast.stripe_account_id;

        // 2. If no stripe account exists, create an Express account
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                email: user.email,
            });
            accountId = account.id;

            // Save the account ID immediately
            await supabase
                .from('podcasts')
                .update({ stripe_account_id: accountId })
                .eq('id', podcastId);
        }

        // 3. Create Account Link for onboarding
        const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${origin}/dashboard/products?status=refresh`,
            return_url: `${origin}/dashboard/products?status=success`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error: any) {
        console.error('Stripe connect error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
