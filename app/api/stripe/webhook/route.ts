import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getCommerceBuyerEmailHtml, getCommerceCreatorEmailHtml, sendResend } from '@/lib/emails';

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2026-02-25.clover' as any,
    });
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        if (!webhookSecret) {
            console.warn('No webhook secret configured. Skipping signature verification.');
            event = JSON.parse(body);
        } else {
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        }
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const productId = session.metadata?.productId;
        const customerEmail = session.customer_details?.email;
        const amountTotal = session.amount_total != null ? session.amount_total / 100 : 0;
        const amountFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: (session.currency || 'usd').toUpperCase() }).format(amountTotal);

        if (productId && customerEmail) {
            const supabase = await createSupabaseServerClient();

            const { data: product } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (product && product.file_path) {
                const { data: signedUrl } = await supabase
                    .storage
                    .from('products')
                    .createSignedUrl(product.file_path, 60 * 60 * 24);

                if (signedUrl?.signedUrl) {
                    const buyerHtml = getCommerceBuyerEmailHtml(product.title || 'Your file', signedUrl.signedUrl);
                    sendResend(customerEmail, 'Your purchase is ready', buyerHtml).catch((e) => console.error('Commerce buyer email failed', e));
                }
            }

            // Creator notification: You made a sale
            const podcastId = product?.podcast_id;
            if (podcastId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
                const admin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY,
                );
                const { data: podcast } = await admin.from('podcasts').select('owner_id').eq('id', podcastId).single();
                if (podcast?.owner_id) {
                    const { data: owner } = await admin.auth.admin.getUserById(podcast.owner_id);
                    const creatorEmail = owner?.user?.email;
                    if (creatorEmail) {
                        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://podsite-killer.vercel.app'}/dashboard`;
                        const creatorHtml = getCommerceCreatorEmailHtml(product?.title || 'Product', amountFormatted, dashboardUrl);
                        sendResend(creatorEmail, 'You made a sale 🎉', creatorHtml).catch((e) => console.error('Creator notification email failed', e));
                    }
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}
