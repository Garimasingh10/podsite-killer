import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { Resend } from 'resend';

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2026-02-25.clover' as any,
    });
    const resend = new Resend(process.env.RESEND_API_KEY || '');
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
                                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w-xl; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: center; border: 1px solid #e5e7eb;">
                                            <h1 style="color: #111827; font-size: 28px; margin-bottom: 16px; font-weight: 700;">Thanks for your purchase!</h1>
                                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">We're thrilled you chose PodSite. You can securely download <strong>${product.title}</strong> using the link below. Please note that for security reasons, this temporary link will expire in 24 hours.</p>
                                            <a href="${signedUrl.signedUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size: 16px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">Download Your File</a>
                                            <hr style="border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                                            <p style="color: #9ca3af; font-size: 14px;">If you have any issues with your download, please reply to this email. We're here to help.</p>
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
