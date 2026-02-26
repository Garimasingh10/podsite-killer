import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import ProductsClient from './_components/ProductsClient';
import Link from 'next/link';
import { ChevronLeft, AlertCircle } from 'lucide-react';

export default async function ProductsPage() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: podcasts } = await supabase
        .from('podcasts')
        .select('id, title, stripe_account_id')
        .eq('owner_id', user.id);

    const activePodcast = podcasts?.[0];

    if (!activePodcast) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 text-center">
                <p className="text-white">No active podcast found.</p>
            </div>
        );
    }

    const stripeAccountId = activePodcast.stripe_account_id;

    // Fetch products
    let products: any[] = [];
    const { data: fetchedProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('podcast_id', activePodcast.id)
        .order('created_at', { ascending: false });

    if (!productsError && fetchedProducts) {
        products = fetchedProducts;
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12 animate-in fade-in">
            <header className="flex items-center justify-between border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Digital Products</h1>
                    <p className="text-slate-400 mt-2">Sell premium audio, PDFs, and bonuses directly on your site.</p>
                </div>
                <Link
                    href={`/dashboard`}
                    className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-6 py-2 text-sm font-bold text-slate-200 transition-all hover:border-primary hover:text-primary"
                >
                    <ChevronLeft size={18} />
                    Dashboard
                </Link>
            </header>

            {!process.env.STRIPE_SECRET_KEY && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl text-sm font-semibold flex items-center gap-3">
                    <AlertCircle size={18} />
                    Developer Notice: Stripe Keys are not configured in environment variables.
                </div>
            )}

            <ProductsClient
                podcastId={activePodcast.id}
                stripeAccountId={stripeAccountId}
                products={products}
            />
        </div>
    );
}
