'use client';

import React, { useState } from 'react';
import { Globe, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DomainsClient({ podcastId, initialDomain }: { podcastId: string, initialDomain: string | null }) {
    const [domain, setDomain] = useState(initialDomain || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedDomain, setSavedDomain] = useState(initialDomain || '');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [isVerified, setIsVerified] = useState(false); // New state for verification
    const router = useRouter();

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!domain) return;

        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain, podcastId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to add domain');
            }

            setSavedDomain(domain);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const checkVerification = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API check for demo purposes, or link to a real check
            const res = await fetch(`/api/domains/check?domain=${savedDomain}`);
            const data = await res.json();
            if (data.verified) {
                setIsVerified(true);
                router.refresh();
            }
        } catch (err) {
            console.error('Verification check failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8">
                <form onSubmit={handleAddDomain} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <Globe size={16} className="text-primary" />
                            Domain Name
                        </label>
                        <p className="text-xs text-slate-400">Enter the domain you want to connect (e.g. podcasts.com or mypodcast.com)</p>
                    </div>

                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="namanspodcast.com"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value.toLowerCase().replace('https://', '').replace('http://', ''))}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || domain === savedDomain || !domain}
                            className="bg-primary text-black px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                            {isSubmitting ? 'Adding...' : savedDomain ? (domain !== savedDomain ? 'Update' : 'Saved') : 'Add Domain'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-6 flex items-start gap-3 bg-red-950/50 border border-red-900/50 text-red-400 p-4 rounded-xl text-sm">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* DNS Instructions appear once a domain is saved */}
            {savedDomain && !error && (
                <div className="bg-primary/10 border-2 border-primary/20 rounded-[2rem] p-8 space-y-6 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between gap-3 text-primary">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={24} />
                            <h2 className="text-xl font-black">Domain Added to Project</h2>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
                            <div className={`h-2 w-2 rounded-full ${isVerified ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                {isVerified ? 'DNS Verified' : 'Pending DNS'}
                            </span>
                        </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-sm">
                        To complete the configuration, add the following <strong className="text-white">A Record</strong> to your DNS settings in your domain registrar (GoDaddy, Namecheap, Route53, etc).
                    </p>

                    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Value</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-200 font-mono">
                                <tr>
                                    <td className="px-6 py-4 border-t border-slate-800">A</td>
                                    <td className="px-6 py-4 border-t border-slate-800">@</td>
                                    <td className="px-6 py-4 border-t border-slate-800 flex justify-between items-center group">
                                        76.76.21.21
                                        <button
                                            onClick={() => copyToClipboard('76.76.21.21')}
                                            className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Copy IP"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                        <AlertCircle size={16} className="text-slate-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-400 leading-relaxed">
                            DNS changes can take up to 24-48 hours to propagate, but usually happen within 15 minutes. Once propagated, your podcast site will be live and automatically receive a free SSL certificate.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={checkVerification}
                            disabled={isSubmitting || isVerified}
                            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.15em] transition-all ${isVerified ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' : 'bg-white text-black hover:bg-primary shadow-lg shadow-white/5 whitespace-nowrap'}`}
                        >
                            {isSubmitting ? 'Checking...' : isVerified ? 'Verified' : 'Check DNS Status'}
                        </button>
                        <a
                            href={`https://${savedDomain}`}
                            target="_blank"
                            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white font-bold text-xs uppercase tracking-[0.15em] transition-all text-center"
                        >
                            Visit Site
                        </a>
                    </div>

                    {copied && (
                        <div className="absolute top-8 right-8 bg-emerald-500 text-black px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg shadow-xl animate-in fade-in slide-in-from-top-4">
                            Copied to clipboard
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
