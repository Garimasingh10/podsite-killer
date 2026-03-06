import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2025-01-27.clover' as any,
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
            .select('*')
            .eq('id', podcastId)
            .eq('owner_id', user.id)
            .single();

        if (!podcast) {
            return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
        }

        let accountId = podcast.stripe_account_id;

        // 2. Create account if not exists
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    podcast_id: podcastId,
                    owner_id: user.id
                }
            });
            accountId = account.id;

            // Save to DB
            await supabase
                .from('podcasts')
                .update({ stripe_account_id: accountId })
                .eq('id', podcastId);
        }

        // 3. Create Account Link
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error: any) {
        console.error('Stripe Connect error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
