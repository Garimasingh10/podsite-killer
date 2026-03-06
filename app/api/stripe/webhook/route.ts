import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getProductDeliveryEmailHtml, sendResend } from '@/lib/emails';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
    apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
        return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle checkout session completion
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === 'paid') {
            const customerEmail = session.customer_details?.email;
            const metadata = session.metadata;

            if (customerEmail && metadata) {
                const { productId, podcastId, filePath, fileName } = metadata;

                // Create a signed URL for the user to securely download the file
                const supabase = await createSupabaseServerClient();
                const { data: signedData, error: signError } = await supabase.storage
                    .from('products')
                    .createSignedUrl(filePath, 60 * 60 * 24 * 7); // Valid for 7 days

                if (signError || !signedData?.signedUrl) {
                    console.error('Failed to generate product download link:', signError);
                } else {
                    const downloadUrl = signedData.signedUrl;
                    
                    // Fetch product title for the email
                    const { data: product } = await supabase
                        .from('products')
                        .select('title')
                        .eq('id', productId)
                        .single();

                    const productName = product?.title || fileName || 'Your Digital Product';

                    console.log(`Sending delivery email to ${customerEmail} for product ${productName}`);

                    const html = getProductDeliveryEmailHtml(productName, downloadUrl);
                    const result = await sendResend(
                        customerEmail,
                        'Your download is ready 🎙️',
                        html
                    );

                    if (!result.ok) {
                        console.error('Failed to send product delivery email:', result.error);
                    } else {
                        console.log('Product Delivery Email successfully dispatched');
                    }
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}
