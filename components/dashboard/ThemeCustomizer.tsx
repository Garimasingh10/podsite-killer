// components/dashboard/ThemeCustomizer.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { ThemeConfig } from '@/components/ThemeEngine';
import { extractColorsFromImage } from '@/lib/utils/colorUtils';
import { Wand2, Layout, Palette, Type, Square } from 'lucide-react';

export default function ThemeCustomizer({
    podcastId,
    imageUrl,
    initialConfig
}: {
    podcastId: string,
    imageUrl?: string,
    initialConfig: ThemeConfig
}) {
    const [config, setConfig] = useState<ThemeConfig>(initialConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const supabase = createSupabaseBrowserClient();
    const router = useRouter();

    async function updateConfig(newConfig: Partial<ThemeConfig>) {
        const updated = { ...config, ...newConfig };
        setConfig(updated);
        setIsSaving(true);

        const { error } = await supabase
            .from('podcasts')
            .update({ theme_config: updated })
            .eq('id', podcastId);

        if (error) console.error('Error saving theme:', error);

        router.refresh();
        // Brief timeout to show saving state then clear
        setTimeout(() => setIsSaving(false), 2000);
    }

    const presets = [
        { name: 'Midnight', primary: '#0ea5e9', accent: '#38bdf8' },
        { name: 'Emerald', primary: '#10b981', accent: '#34d399' },
        { name: 'Sunset', primary: '#f43f5e', accent: '#fb7185' },
        { name: 'Violet', primary: '#8b5cf6', accent: '#a78bfa' },
        { name: 'Amber', primary: '#f59e0b', accent: '#fbbf24' },
    ];

    async function handleMagicTheme() {
        if (!imageUrl) return;
        setIsExtracting(true);
        try {
            const extracted = await extractColorsFromImage(imageUrl);
            const newConfig: ThemeConfig = {
                ...config,
                primaryColor: extracted.primary,
                backgroundColor: extracted.background,
                foregroundColor: extracted.foreground,
                accentColor: extracted.accent,
                borderColor: extracted.border,
            };
            await updateConfig(newConfig);
        } catch (err) {
            console.error('Magic theme failed:', err);
        } finally {
            setIsExtracting(false);
        }
    }

    const layouts = [
        { id: 'netflix', name: 'Netflix', desc: 'Video-First' },
        { id: 'substack', name: 'Substack', desc: 'Typography' },
        { id: 'genz', name: 'Gen Z', desc: 'Bold' },
    ];

    const fontPairings = [
        { id: 'default_sans', name: 'Classic Sans', heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
        { id: 'modern_serif', name: 'Modern Serif', heading: "'Fraunces', serif", body: "'Inter', sans-serif" },
        { id: 'tech_mono', name: 'Tech Mono', heading: "'JetBrains Mono', monospace", body: "'Inter', sans-serif" },
    ];

    return (
        <div className="space-y-10">
            {/* Visual Engine / Layout Selection */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Visual Engine</h3>
                    <button
                        onClick={handleMagicTheme}
                        disabled={!imageUrl || isExtracting}
                        className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary transition-all hover:bg-primary/20 disabled:opacity-50"
                    >
                        <Wand2 size={14} className={isExtracting ? 'animate-spin' : ''} />
                        {isExtracting ? 'Analyzing...' : 'Magic Theme'}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {layouts.map((l) => (
                        <button
                            key={l.id}
                            onClick={() => updateConfig({ layout: l.id as any })}
                            className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all ${config.layout === l.id
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                                }`}
                        >
                            <Layout size={18} className={`mb-2 ${config.layout === l.id ? 'text-primary' : 'text-slate-500'}`} />
                            <span className={`text-sm font-bold ${config.layout === l.id ? 'text-white' : 'text-slate-400'}`}>{l.name}</span>
                            <span className="text-[10px] text-slate-600 uppercase tracking-tighter">{l.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors & Typography Grid */}
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                {/* Left Column: Colors */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                            <Palette size={14} /> Color Presets
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {presets.map((p) => (
                                <button
                                    key={p.name}
                                    onClick={() => updateConfig({ primaryColor: p.primary, accentColor: p.accent })}
                                    className="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-[10px] font-bold text-slate-400 transition-all hover:border-slate-600 hover:text-white"
                                >
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: p.primary }}
                                    />
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                            Custom Colors
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-2 pl-4">
                                <span className="text-xs font-bold text-slate-400">Primary</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={config.primaryColor || '#0ea5e9'}
                                        onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                                        className="w-20 bg-transparent text-right font-mono text-xs text-white focus:outline-none"
                                    />
                                    <input
                                        type="color"
                                        value={config.primaryColor || '#0ea5e9'}
                                        onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                                        className="h-6 w-6 cursor-pointer overflow-hidden rounded bg-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-2 pl-4">
                                <span className="text-xs font-bold text-slate-400">Accent</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={config.accentColor || '#f59e0b'}
                                        onChange={(e) => updateConfig({ accentColor: e.target.value })}
                                        className="w-20 bg-transparent text-right font-mono text-xs text-white focus:outline-none"
                                    />
                                    <input
                                        type="color"
                                        value={config.accentColor || '#f59e0b'}
                                        onChange={(e) => updateConfig({ accentColor: e.target.value })}
                                        className="h-6 w-6 cursor-pointer overflow-hidden rounded bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Typography & Shapes */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                            <Type size={14} /> Typography
                        </h4>
                        <div className="flex flex-col gap-2">
                            {fontPairings.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => updateConfig({ fontHeading: p.heading, fontBody: p.body })}
                                    className={`group flex items-center justify-between rounded-xl border p-4 transition-all ${config.fontHeading === p.heading
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex flex-col items-start min-w-0">
                                        <span className={`text-sm font-bold truncate ${config.fontHeading === p.heading ? 'text-primary' : 'text-slate-300'}`}>
                                            {p.name}
                                        </span>
                                        <span className="text-[10px] text-slate-600 font-bold">Standard</span>
                                    </div>
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${config.fontHeading === p.heading ? 'border-primary/50 text-primary' : 'border-slate-800 text-slate-600'}`}>
                                        <span className="text-sm font-serif">Aa</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                            <Square size={14} /> Corner Radius
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                            {['0px', '8px', '24px'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => updateConfig({ cornerRadius: r })}
                                    className={`rounded-xl border py-3 text-[10px] font-black uppercase tracking-widest transition-all ${config.cornerRadius === r
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700'
                                        }`}
                                >
                                    {r === '0px' ? 'Sharp' : r === '8px' ? 'Round' : 'Bubble'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isSaving && (
                <div className="flex items-center justify-center pt-4">
                    <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20">
                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                        Live Sync Active
                    </div>
                </div>
            )}
        </div>
    );
}
