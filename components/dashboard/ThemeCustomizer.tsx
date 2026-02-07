// components/dashboard/ThemeCustomizer.tsx
'use client';

import React, { useState } from 'react';
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

    async function updateConfig(newConfig: Partial<ThemeConfig>) {
        const updated = { ...config, ...newConfig };
        setConfig(updated);
        setIsSaving(true);

        const { error } = await supabase
            .from('podcasts')
            .update({ theme_config: updated })
            .eq('id', podcastId);

        if (error) console.error('Error saving theme:', error);
        setIsSaving(false);
    }

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
        { id: 'netflix', name: 'Netflix', desc: 'Dark / Video-First' },
        { id: 'substack', name: 'Substack', desc: 'Clean / Typography' },
        { id: 'genz', name: 'Gen Z', desc: 'Brutalist / Bold' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-200">Visual Engine</h3>
                    <button
                        onClick={handleMagicTheme}
                        disabled={!imageUrl || isExtracting}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                    >
                        <Wand2 size={16} className={isExtracting ? 'animate-spin' : ''} />
                        {isExtracting ? 'Analyzing...' : 'Magic Theme'}
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {layouts.map((l) => (
                        <button
                            key={l.id}
                            onClick={() => updateConfig({ layout: l.id as any })}
                            className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all ${config.layout === l.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                                }`}
                        >
                            <Layout size={20} className="mb-2 text-primary" />
                            <span className="font-bold text-slate-200">{l.name}</span>
                            <span className="text-xs text-slate-500">{l.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                        <Palette size={14} /> Colors
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">Primary Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={config.primaryColor || '#0ea5e9'}
                                    onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                                    className="h-8 w-8 cursor-pointer rounded bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={config.primaryColor || '#0ea5e9'}
                                    onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                                    className="flex-1 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">Accent Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={config.accentColor || '#f59e0b'}
                                    onChange={(e) => updateConfig({ accentColor: e.target.value })}
                                    className="h-8 w-8 cursor-pointer rounded bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={config.accentColor || '#f59e0b'}
                                    onChange={(e) => updateConfig({ accentColor: e.target.value })}
                                    className="flex-1 rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                        <Square size={14} /> Shapes
                    </h4>
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400">Corner Radius</label>
                        <div className="flex gap-2">
                            {['0px', '8px', '24px'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => updateConfig({ cornerRadius: r })}
                                    className={`flex-1 rounded-lg border py-2 text-xs font-bold transition-all ${config.cornerRadius === r
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                                        }`}
                                >
                                    {r === '0px' ? 'Sharp' : r === '8px' ? 'Rounded' : 'Bubble'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isSaving && (
                <div className="fixed bottom-8 right-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-white shadow-2xl">
                        Changes Saved Automatically
                    </div>
                </div>
            )}
        </div>
    );
}
