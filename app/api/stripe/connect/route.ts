import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia',
});

export async function POST(req: Request) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { podcastId } = await req.json();

        // Verify podcast ownership
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

        // If no account exists, create one
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            accountId = account.id;

            // Save to DB
            const { error: dbError } = await supabase
                .from('podcasts')
                .update({ stripe_account_id: accountId })
                .eq('id', podcastId);

            if (dbError) {
                console.error('Failed to save stripe_account_id', dbError);
                // Check if column exists
                if (dbError.message.includes('column "stripe_account_id" of relation "podcasts" does not exist')) {
                    throw new Error('Database column stripe_account_id is missing. Please run migration.');
                }
                throw new Error('Database error');
            }
        }

        // Create account link for onboarding
        const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/products`;

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: returnUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error: any) {
        console.error('Stripe connect error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
