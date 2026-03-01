'use client';

import React, { useState, useRef } from 'react';
import ThemeCustomizer from './ThemeCustomizer';
import BlockReorder from './BlockReorder';
import { ThemeConfig } from '@/components/ThemeEngine';
import { updateSettingsAction } from '@/app/(dashboard)/podcasts/[id]/settings/actions';
import { Save, Check, ChevronLeft, Smartphone, Monitor, Sparkles, Type, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SplitScreenEditor({ podcast }: { podcast: any }) {
    const initialConfig = (podcast.theme_config as ThemeConfig) || {};
    const [config, setConfig] = useState<ThemeConfig>(initialConfig);
    const [layout, setLayout] = useState<string[]>((podcast.page_layout as string[]) || ['hero', 'subscribe', 'grid', 'host', 'shorts', 'product']);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const router = useRouter();

    const handleConfigChange = (newConfig: ThemeConfig) => {
        setConfig(newConfig);
        setHasUnsavedChanges(true);
        setIsSaved(false);
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_THEME', payload: newConfig }, '*');
        }
    };

    const handleLayoutChange = (newLayout: string[]) => {
        setLayout(newLayout);
        setHasUnsavedChanges(true);
        setIsSaved(false);
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_LAYOUT', payload: newLayout }, '*');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettingsAction(podcast.id, {
                theme_config: config,
                page_layout: layout,
            });
            setHasUnsavedChanges(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
            router.refresh();
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const iframeUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/${podcast.id}` : '';

    return (
        <div className="flex h-full w-full flex-col md:flex-row bg-slate-950 overflow-hidden">
            {/* Left Panel: Settings (30%) */}
            <div className="w-full md:w-[35%] flex flex-col border-r border-white/10 bg-slate-950 shadow-2xl z-10">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={16} /> Back
                    </Link>
                    <div className="flex bg-slate-900 rounded-lg p-1">
                        <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded-md transition-colors ${device === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
                            <Monitor size={16} />
                        </button>
                        <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded-md transition-colors ${device === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
                            <Smartphone size={16} />
                        </button>
                    </div>
                </div>

                {/* Settings Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-12 pb-32">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white">Customize Site</h2>
                        <p className="text-xs text-slate-400">Design your brand and page layout.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Metadata & AI</h3>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/ai/suggest-description', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ title: podcast.title, description: podcast.description })
                                        });
                                        const data = await res.json();
                                        if (data.suggestion) {
                                            if (confirm(`AI suggested new description:\n\n"${data.suggestion}"\n\nApply this?`)) {
                                                // We need a way to track local content changes
                                            }
                                        }
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                className="flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 Transition-all hover:bg-indigo-500/20"
                            >
                                <Sparkles size={12} />
                                Magic SEO
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Podcast Title</label>
                                <input
                                    defaultValue={podcast.title}
                                    disabled
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-sm text-slate-400 opacity-50 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Site Name</label>
                                <input
                                    placeholder="My Cool Site"
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>
                        </div>
                    </div>

                    <ThemeCustomizer
                        config={config}
                        onChange={handleConfigChange}
                        imageUrl={config.imageUrl}
                    />

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Page Layout</h3>
                        <BlockReorder
                            podcastId={podcast.id}
                            items={layout}
                            onChange={handleLayoutChange}
                        />
                    </div>
                </div>

                {/* Save Bar */}
                <div className="p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || (!hasUnsavedChanges && !isSaved)}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-widest transition-all ${isSaved ? 'bg-emerald-500 text-black' : hasUnsavedChanges ? 'bg-primary text-black hover:scale-[1.02]' : 'bg-slate-800 text-slate-500'}`}
                    >
                        {isSaving ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : isSaved ? (
                            <Check size={18} strokeWidth={3} />
                        ) : (
                            <Save size={18} strokeWidth={3} />
                        )}
                        {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Right Panel: Live Preview (70%) */}
            <div className={`hidden md:flex flex-1 items-center justify-center bg-zinc-950 p-6 lg:p-12 relative`}>
                <div className="absolute inset-0 opacity-20 pointer-events-none" />

                <div className={`flex flex-col relative overflow-hidden rounded-[2rem] border-4 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-500 bg-[#1e1e1e] ${device === 'mobile' ? 'w-[375px] h-[812px]' : 'w-full h-full'}`}>
                    {/* Browser Shell Header */}
                    <div className="flex h-12 w-full items-center justify-between border-b border-white/5 bg-[#2d2d2d] px-6">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
                        </div>
                        <div className="flex-1 max-w-md mx-6">
                            <div className="flex h-7 w-full items-center justify-center rounded-md bg-[#1e1e1e] px-4 text-[10px] text-slate-400 font-mono border border-white/5">
                                {typeof window !== 'undefined' ? window.location.host : 'localhost'}/{podcast.id}
                            </div>
                        </div>
                        <div className="w-16" />
                    </div>

                    <div className="flex-1 w-full bg-white relative">
                        {iframeUrl && (
                            <iframe
                                ref={iframeRef}
                                src={iframeUrl}
                                className="w-full h-full"
                                title="Live Preview"
                            />
                        )}
                        <div className="absolute inset-0 pointer-events-none border-t border-black/5" />
                    </div>
                </div>
            </div>
        </div>
    );
}
