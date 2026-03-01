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
    const [title, setTitle] = useState(podcast.title || '');
    const [tagline, setTagline] = useState(initialConfig.tagline || '');
    const [description, setDescription] = useState(podcast.description || '');
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
            const updatedConfig = { ...config, tagline };
            await updateSettingsAction(podcast.id, {
                title,
                description,
                theme_config: updatedConfig,
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

    const handleToggleHidden = (id: string) => {
        const currentHidden = config.hiddenBlocks || [];
        const newHidden = currentHidden.includes(id)
            ? currentHidden.filter(x => x !== id)
            : [...currentHidden, id];
        handleConfigChange({ ...config, hiddenBlocks: newHidden });
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
                                                setDescription(data.suggestion);
                                                setHasUnsavedChanges(true);
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
                                    value={title}
                                    onChange={(e) => { setTitle(e.target.value); setHasUnsavedChanges(true); }}
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Tagline / Subtitle</label>
                                <input
                                    value={tagline}
                                    placeholder="Your podcast's catchy hook..."
                                    onChange={(e) => { setTagline(e.target.value); setHasUnsavedChanges(true); }}
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => { setDescription(e.target.value); setHasUnsavedChanges(true); }}
                                    rows={3}
                                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branding Section */}
                    <div className="pt-2 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Branding</h3>
                        <div className="rounded-2xl border border-white/5 bg-slate-900 p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-white">Site Logo</p>
                                <p className="text-[10px] text-slate-500">Used in header & favicon</p>
                            </div>
                            <button className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                                Upload Logo
                            </button>
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
                            hiddenItems={config.hiddenBlocks}
                            onChange={handleLayoutChange}
                            onToggleHidden={handleToggleHidden}
                        />
                    </div>

                    {/* Advanced & Danger Zone */}
                    <div className="pt-12 border-t border-white/5 space-y-8 pb-10">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600">RSS Connection</h4>
                            <div className="rounded-xl border border-white/5 bg-slate-900/50 p-4">
                                <code className="text-[10px] text-slate-500 break-all">{podcast.rss_url}</code>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-900/50">Danger Zone</h4>
                            <button className="w-full rounded-xl border border-red-900/20 bg-red-950/10 py-3 text-xs font-bold text-red-500/60 transition-all hover:bg-red-500 hover:text-black">
                                Delete Podcast
                            </button>
                        </div>
                    </div>
                </div>

                {/* Save Bar */}
                <div className="fixed bottom-6 left-0 md:w-[35%] w-full px-6 bg-transparent pointer-events-none z-50">
                    <div className="max-w-md mx-auto pointer-events-auto">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || (!hasUnsavedChanges && !isSaved)}
                            className={`w-full flex items-center justify-center gap-3 rounded-full px-8 py-5 text-xs font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 backdrop-blur-md border ${isSaved ? 'bg-emerald-500 text-black border-emerald-400' : hasUnsavedChanges ? 'bg-primary text-black border-white/20 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)]' : 'bg-slate-900/80 text-white/40 border-white/10 hover:border-white/20'}`}
                        >
                            {isSaving ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : isSaved ? (
                                <Check size={18} strokeWidth={4} />
                            ) : (
                                <Save size={18} strokeWidth={3} className={hasUnsavedChanges ? 'animate-pulse' : ''} />
                            )}
                            <span className="relative">
                                {isSaving ? 'Syncing...' : isSaved ? 'Site Published' : hasUnsavedChanges ? 'Publish Changes' : 'All Changes Saved'}
                            </span>
                        </button>
                    </div>
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
