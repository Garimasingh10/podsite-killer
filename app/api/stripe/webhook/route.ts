import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia' as any,
});
const resend = new Resend(process.env.RESEND_API_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
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

        if (productId && customerEmail) {
            const supabase = await createSupabaseServerClient();

            // Get product file path
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
                    try {
                        const emailOpts = {
                            from: 'PodSite <noreply@podsitekiller.com>',
                            to: customerEmail,
                            subject: `Your Download: ${product.title}`,
                            html: `
                                <div style="font-family: sans-serif; max-w-xl; margin: 0 auto; text-align: center;">
                                    <h1>Thanks for your purchase!</h1>
                                    <p>You can download ${product.title} using the link below. This link expires in 24 hours.</p>
                                    <a href="${signedUrl.signedUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:white;text-decoration:none;border-radius:8px;font-weight:bold;margin-top:20px;">Download File</a>
                                </div>
                            `
                        };

                        if (process.env.RESEND_API_KEY) {
                            await resend.emails.send(emailOpts);
                        } else {
                            console.log('Would have sent email (missing RESEND API KEY):', emailOpts);
                        }
                    } catch (e) {
                        console.error('Failed to send Resend email', e);
                    }
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}
