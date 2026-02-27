import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2026-02-25.clover' as any,
    });
    try {
        const { productId } = await req.json();
        const supabase = await createSupabaseServerClient();

        // Fetch product and its podcast
        const { data: product } = await supabase
            .from('products')
            .select(`
                *,
                podcasts(
                    id, 
                    title,
                    custom_domain,
                    stripe_account_id
                )
            `)
            .eq('id', productId)
            .single();

        if (!product || !(product.podcasts as any)?.stripe_account_id) {
            return NextResponse.json({ error: 'Product unavailable' }, { status: 400 });
        }

        const podcast = product.podcasts as any;

        // 10% application fee for instance
        const feePercentage = 0.10;
        const applicationFeeAmount = Math.round(product.price * feePercentage * 100);

        const successUrl = podcast.custom_domain
            ? `https://${podcast.custom_domain}?success=true`
            : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${podcast.id}?success=true`;

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.title,
                        description: product.description || undefined,
                    },
                    unit_amount: Math.round(product.price * 100), // in cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: `${successUrl.split('?')[0]}?canceled=true`,
            payment_intent_data: {
                application_fee_amount: applicationFeeAmount,
                transfer_data: {
                    destination: podcast.stripe_account_id,
                },
            },
            metadata: {
                productId: product.id,
                podcastId: podcast.id,
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
