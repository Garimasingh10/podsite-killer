'use client';

import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

export default function ProductBlock({ product }: { product: any }) {
    const [isRedirecting, setIsRedirecting] = useState(false);

    if (!product) return null;

    const handleBuy = async () => {
        setIsRedirecting(true);
        try {
            const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to start checkout');
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message);
            setIsRedirecting(false);
        }
    };

    return (
        <section className="py-24 px-4 bg-[var(--background)]">
            <div className="mx-auto max-w-4xl text-center">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] mb-6">
                    <ShoppingBag size={32} />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tight mb-4">
                    Exclusive Content
                </h2>
                <h3 className="text-2xl font-bold text-[var(--primary)] mb-6">{product.title}</h3>
                <p className="max-w-xl mx-auto text-lg text-[var(--foreground)]/70 mb-10 leading-relaxed">
                    {product.description || 'Get instant access to this exclusive digital product.'}
                </p>
                <button
                    onClick={handleBuy}
                    disabled={isRedirecting}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[var(--primary)] px-12 py-5 font-black uppercase text-[var(--background)] shadow-[0_0_40px_var(--primary)] transition-all hover:scale-105 hover:shadow-[0_0_60px_var(--primary)] disabled:opacity-50"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        {isRedirecting ? 'Processing...' : `Get it for $${product.price.toFixed(2)}`}
                    </span>
                    <div className="absolute inset-0 z-0 h-full w-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
            </div>
        </section>
    );
}
