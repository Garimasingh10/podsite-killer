'use client';

import React, { useState, useEffect } from 'react';
import { Globe, ShieldCheck, AlertCircle, Copy, Check, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function DomainsPage() {
    const searchParams = useSearchParams();
    const podcastId = searchParams.get('podcastId');
    
    const [domain, setDomain] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState<{ verified: boolean; error?: string } | null>(null);

    const handleAddDomain = async () => {
        if (!domain) return;
        setIsSaving(true);
        setSaveError('');
        setSaveSuccess(false);
        
        try {
            const res = await fetch('/api/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, podcastId })
            });
            const data = await res.json();
            if (data.success) {
                setSaveSuccess(true);
            } else {
                setSaveError(data.error || 'Failed to add domain');
            }
        } catch (err) {
            setSaveError('Network error. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        setVerifyResult(null);
        try {
            const res = await fetch(`/api/domains/check?domain=${domain}`);
            const data = await res.json();
            setVerifyResult(data);
        } catch (err) {
            setVerifyResult({ verified: false, error: 'Verification service unavailable' });
        } finally {
            setIsVerifying(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="space-y-12 pb-20 max-w-4xl mx-auto px-4">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                    Custom Domains
                </h1>
                <p className="text-slate-400 font-medium tracking-tight">
                    Connect your own domain name (e.g., <span className="text-primary italic">www.yourpodcast.com</span>) to your site.
                </p>
            </div>

            <div className="grid gap-8">
                {/* 1. Add Domain Section */}
                <section className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Globe size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight uppercase">1. Link your domain</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group">
                            <input
                                type="text"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value.toLowerCase().trim())}
                                placeholder="podcastsite.com"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-lg text-white font-mono focus:outline-none focus:border-primary/50 transition-all placeholder:text-slate-700"
                            />
                            {saveSuccess && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in">
                                    <Check size={24} />
                                </div>
                            )}
                        </div>

                        {saveError && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
                                <AlertCircle size={18} />
                                {saveError}
                            </div>
                        )}

                        <button
                            onClick={handleAddDomain}
                            disabled={isSaving || !domain || saveSuccess}
                            className="w-full md:w-auto px-12 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] italic hover:bg-primary transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:scale-95"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Globe size={20} />}
                            {saveSuccess ? 'Domain Linked!' : 'Save Domain'}
                        </button>
                    </div>
                </section>

                {/* 2. DNS Instructions (Visible once domain is typed) */}
                {domain && (
                    <section className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl animate-in slide-in-from-bottom-8 duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight uppercase">2. Configure DNS</h2>
                        </div>

                        <p className="text-sm text-slate-400 mb-8 font-medium leading-relaxed">
                            Log in to your domain provider (GoDaddy, Namecheap, etc.) and update your DNS settings to match these records:
                        </p>

                        <div className="space-y-4">
                            {/* A Record */}
                            <div className="group rounded-2xl border border-white/5 bg-slate-950 p-6 hover:border-white/10 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">A Record</span>
                                    <button onClick={() => copyToClipboard('76.76.21.21')} className="text-primary hover:text-white transition-colors"><Copy size={14} /></button>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm font-mono">
                                    <div className="col-span-1 text-slate-500">Hostname</div>
                                    <div className="col-span-2 text-white">@</div>
                                    <div className="col-span-1 text-slate-500">Value</div>
                                    <div className="col-span-2 text-primary font-black">76.76.21.21</div>
                                </div>
                            </div>

                            {/* CNAME Record */}
                            <div className="group rounded-2xl border border-white/5 bg-slate-950 p-6 hover:border-white/10 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">CNAME Record</span>
                                    <button onClick={() => copyToClipboard('cname.vercel-dns.com')} className="text-primary hover:text-white transition-colors"><Copy size={14} /></button>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm font-mono">
                                    <div className="col-span-1 text-slate-500">Hostname</div>
                                    <div className="col-span-2 text-white">www</div>
                                    <div className="col-span-1 text-slate-500">Value</div>
                                    <div className="col-span-2 text-primary font-black">cname.vercel-dns.com</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center gap-6">
                            <button
                                onClick={handleVerify}
                                disabled={isVerifying}
                                className="w-full md:w-auto px-10 py-4 rounded-xl border-2 border-primary text-primary font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2"
                            >
                                {isVerifying ? <Loader2 className="animate-spin" size={16} /> : <ExternalLink size={16} />}
                                Verify Configuration
                            </button>

                            {verifyResult && (
                                <div className={`flex items-center gap-2 text-sm font-bold ${verifyResult.verified ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {verifyResult.verified ? (
                                        <><Check size={18} /> Verified & Active!</>
                                    ) : (
                                        <><AlertCircle size={18} /> Propagation in progress...</>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
