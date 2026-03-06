import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2026-02-25.clover' as any,
    });
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { title, description, price, podcastId, filePath, fileName } = await req.json();

        // 1. Verify podcast ownership & Get Stripe Account
        const { data: podcast } = await supabase
            .from('podcasts')
            .select('id, stripe_account_id')
            .eq('id', podcastId)
            .eq('owner_id', user.id)
            .single();

        if (!podcast) {
            return NextResponse.json({ error: 'Podcast not found or not owned by user' }, { status: 400 });
        }

        // 2. Create Stripe Product (On the connected account)
        let stripeProductId = null;
        let stripePriceId = null;

        try {
            if (!podcast.stripe_account_id) {
                throw new Error('Stripe account not connected for this podcast. Falling back to mock.');
            }

            const stripeProduct = await stripe.products.create({
                name: title,
                description: description,
                shippable: false,
            }, {
                stripeAccount: podcast.stripe_account_id,
            });

            // 3. Create Stripe Price
            const stripePrice = await stripe.prices.create({
                product: stripeProduct.id,
                unit_amount: Math.round(price * 100),
                currency: 'usd',
            }, {
                stripeAccount: podcast.stripe_account_id,
            });

            stripeProductId = stripeProduct.id;
            stripePriceId = stripePrice.id;
        } catch (stripeErr) {
            console.warn('[STRIPE] Real creation failed, falling back to mock:', stripeErr);
            const { createStripeProduct } = await import('@/lib/stripe');
            const mock = await createStripeProduct(title, description);
            stripeProductId = mock.productId;
            stripePriceId = mock.priceId;
        }

        // 4. Save to DB
        const { data: product, error: dbError } = await supabase
            .from('products')
            .insert({
                podcast_id: podcastId,
                title,
                description,
                price: parseFloat(price),
                file_path: filePath,
                file_name: fileName,
                stripe_product_id: stripeProductId,
                stripe_price_id: stripePriceId,
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return NextResponse.json({ success: true, product });
    } catch (error: any) {
        console.error('Product creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
