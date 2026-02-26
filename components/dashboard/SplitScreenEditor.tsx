'use client';

import React, { useState, useRef } from 'react';
import ThemeCustomizer from './ThemeCustomizer';
import BlockReorder from './BlockReorder';
import { ThemeConfig } from '@/components/ThemeEngine';
import { updateSettingsAction } from '@/app/(dashboard)/podcasts/[id]/settings/actions';
import { Save, Check, ChevronLeft, Smartphone, Monitor } from 'lucide-react';
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
            <div className={`hidden md:flex flex-1 items-center justify-center bg-zinc-950 p-6 relative`}>
                <div className="absolute inset-0 opacity-20 pointer-events-none" />

                <div className={`relative overflow-hidden rounded-[2rem] border-4 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-500 ${device === 'mobile' ? 'w-[375px] h-[812px]' : 'w-full h-full'}`}>
                    {iframeUrl && (
                        <iframe
                            ref={iframeRef}
                            src={iframeUrl}
                            className="w-full h-full bg-white"
                            title="Live Preview"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
