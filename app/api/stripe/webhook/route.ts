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
                            subject: `Download Ready: ${product.title}`,
                            html: `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <style>
                                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                                    </style>
                                </head>
                                <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; padding: 48px 24px;">
                                        <tr>
                                            <td align="center">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;">
                                                    <!-- Header Accent -->
                                                    <tr>
                                                        <td style="height: 8px; background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);"></td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 48px; text-align: center;">
                                                            <div style="margin-bottom: 32px;">
                                                                <span style="background: #eef2ff; color: #6366f1; padding: 8px 16px; border-radius: 99px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Order Confirmed</span>
                                                            </div>
                                                            <h1 style="color: #111827; font-size: 32px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -0.02em;">Thank you for your purchase!</h1>
                                                            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 40px 0;">We're excited to get <strong>${product.title}</strong> into your hands. Your secure download link is ready below.</p>
                                                            
                                                            <a href="${signedUrl.signedUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 18px 40px; border-radius: 16px; font-size: 16px; font-weight: 700; text-decoration: none; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                                                                Download Now
                                                            </a>
                                                            
                                                            <div style="margin-top: 40px; padding: 20px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9; text-align: left;">
                                                                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                                                    <span style="color: #111827; font-size: 14px; font-weight: 700;">Security Note</span>
                                                                </div>
                                                                <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">For your protection, this link is temporary and will expire in <span style="color: #ef4444; font-weight: 600;">24 hours</span>. Please ensure you save the file to your device after downloading.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 32px 48px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                                                            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">Need help? Reply to this email or visit our support center.</p>
                                                            <p style="color: #cbd5e1; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} PodSite Inc. All rights reserved.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </body>
                                </html>
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
