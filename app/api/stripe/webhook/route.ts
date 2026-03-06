import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Stripe from 'stripe';
import { getProductDeliveryEmailHtml, sendResend } from '@/lib/emails';

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2025-01-27.clover' as any,
    });
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;

    try {
        if (!sig || !endpointSecret) {
            // Handle mock or development mode where secret might be missing
            event = JSON.parse(body);
        } else {
            event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
        }
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const customerEmail = session.customer_details?.email;
        const productId = session.metadata?.productId;
        
        if (customerEmail && productId) {
            // 1. Get product details
            const { data: product } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();
            
            if (product) {
                // 2. Generate signed download link (Example using Supabase)
                const { data: signedUrl } = await supabase.storage
                    .from('products')
                    .createSignedUrl(product.file_path, 60 * 60 * 24 * 7); // 7 days

                if (signedUrl) {
                    // 3. Send email to buyer
                    const emailHtml = getProductDeliveryEmailHtml(product.title, signedUrl.signedUrl);
                    await sendResend(customerEmail, `Your download is ready: ${product.title}`, emailHtml);
                    
                    console.log(`✅ Product delivered to ${customerEmail}`);
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}
