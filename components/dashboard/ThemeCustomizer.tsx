// components/dashboard/ThemeCustomizer.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { ThemeConfig } from '@/components/ThemeEngine';
import { extractColorsFromImage } from '@/lib/utils/colorUtils';
import { Wand2, Layout, Palette, Type, Square } from 'lucide-react';

export default function ThemeCustomizer({
    config,
    onChange,
    imageUrl,
}: {
    config: ThemeConfig,
    onChange: (config: ThemeConfig) => void,
    imageUrl?: string,
}) {
    const [isExtracting, setIsExtracting] = useState(false);
    const [localFontUrl, setLocalFontUrl] = useState(config.customFontUrl || '');

    function updateConfig(newConfig: Partial<ThemeConfig>) {
        console.log('🔧 ThemeCustomizer updateConfig called:', newConfig);
        onChange({ ...config, ...newConfig });
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
            onChange(newConfig);
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
                            onClick={() => updateConfig({ layout: l.id as ThemeConfig['layout'] })}
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
                            <div className="flex items-center justify-between rounded-xl border-2 border-slate-800 bg-slate-950 p-2.5 pl-4 pr-3 transition-all hover:border-[var(--primary)] group">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Primary</span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={config.primaryColor || '#0ea5e9'}
                                        onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                                        className="w-16 bg-transparent text-right font-mono text-xs text-slate-400 group-hover:text-white focus:outline-none transition-colors"
                                    />
                                    <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md bg-slate-800 ring-1 ring-white/10 shadow-lg transition-all group-hover:ring-[var(--primary)]/50">
                                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: config.primaryColor || '#0ea5e9' }} />
                                        <input
                                            type="color"
                                            value={config.primaryColor || '#0ea5e9'}
                                            onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                                            className="absolute -inset-4 h-16 w-16 cursor-pointer opacity-0"
                                        />
                                    </div>
                                </div>
                            </div>
                             <div className="flex items-center justify-between rounded-xl border-2 border-slate-800 bg-slate-950 p-2.5 pl-4 pr-3 transition-all hover:border-[var(--primary)] group">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Background</span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={config.backgroundColor || '#020617'}
                                        onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                                        className="w-16 bg-transparent text-right font-mono text-xs text-slate-400 group-hover:text-white focus:outline-none transition-colors"
                                    />
                                    <div className="relative flex-shrink-0 h-8 w-8 overflow-hidden rounded-md bg-slate-800 ring-1 ring-white/10 shadow-lg transition-all group-hover:ring-[var(--primary)]/50">
                                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: config.backgroundColor || '#020617' }} />
                                        <input
                                            type="color"
                                            value={config.backgroundColor || '#020617'}
                                            onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                                            className="absolute -inset-4 h-16 w-16 cursor-pointer opacity-0"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border-2 border-slate-800 bg-slate-950 p-2.5 pl-4 pr-3 transition-all hover:border-[var(--primary)] group">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">Accent</span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={config.accentColor || '#f59e0b'}
                                        onChange={(e) => updateConfig({ accentColor: e.target.value })}
                                        className="w-16 bg-transparent text-right font-mono text-xs text-slate-400 group-hover:text-white focus:outline-none transition-colors"
                                    />
                                    <div className="relative flex-shrink-0 h-8 w-8 overflow-hidden rounded-md bg-slate-800 ring-1 ring-white/10 shadow-lg transition-all group-hover:ring-[var(--primary)]/50">
                                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: config.accentColor || '#f59e0b' }} />
                                        <input
                                            type="color"
                                            value={config.accentColor || '#f59e0b'}
                                            onChange={(e) => updateConfig({ accentColor: e.target.value })}
                                            className="absolute -inset-4 h-16 w-16 cursor-pointer opacity-0"
                                        />
                                    </div>
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
                                    onClick={() => {
                                        setLocalFontUrl('');
                                        updateConfig({ fontHeading: p.heading, fontBody: p.body, customFontUrl: '' });
                                    }}
                                    className={`group flex items-center justify-between rounded-xl border p-3.5 transition-all ${config.fontHeading === p.heading && !config.customFontUrl
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex flex-col items-start min-w-0">
                                        <span className={`text-sm font-bold truncate ${config.fontHeading === p.heading && !config.customFontUrl ? 'text-primary' : 'text-slate-300'}`}>
                                            {p.name}
                                        </span>
                                        <span className="text-[10px] text-slate-600 font-bold">Standard</span>
                                    </div>
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${config.fontHeading === p.heading && !config.customFontUrl ? 'border-primary/50 text-primary' : 'border-slate-800 text-slate-600'}`}>
                                        <span className="text-sm font-serif">Aa</span>
                                    </div>
                                </button>
                            ))}

                            <div className={`space-y-3 rounded-xl border-2 p-4 transition-all flex flex-col ${config.customFontUrl ? 'border-[var(--primary)] bg-primary/5' : 'border-slate-800 bg-slate-950'}`}>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Custom Font URL</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        placeholder="https://fonts.googleapis.com/..."
                                        value={localFontUrl}
                                        onChange={(e) => setLocalFontUrl(e.target.value)}
                                        className="w-full bg-slate-900/50 rounded-md px-3 py-2 text-xs text-white focus:outline-none placeholder:text-slate-700 font-mono border border-white/5 focus:border-[var(--primary)]/50"
                                    />
                                    <button
                                        onClick={() => {
                                            let finalUrl = localFontUrl;
                                            if (finalUrl && !finalUrl.startsWith('http')) {
                                                const fontName = finalUrl.replace(/\s+/g, '+');
                                                finalUrl = `https://fonts.googleapis.com/css2?family=${fontName}:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap`;
                                            }
                                            updateConfig({ customFontUrl: finalUrl });
                                        }}
                                        className="w-full rounded-md bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:bg-slate-200 active:scale-95"
                                    >
                                        Apply
                                    </button>
                                </div>
                                <p className="text-[9px] text-slate-600 italic px-1 m-0">Paste a Google Fonts URL or Font Name.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                            <Square size={14} /> Corner Radius
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                            {['0px', '8px', '16px'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => updateConfig({ cornerRadius: r })}
                                    className={`rounded-md border-2 py-2 px-1 text-[10px] font-black uppercase tracking-widest transition-all ${config.cornerRadius === r
                                        ? 'border-[var(--primary)] bg-[var(--primary)] text-black shadow-sm'
                                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                        }`}
                                >
                                    {r === '0px' ? 'Sharp' : r === '8px' ? 'Soft' : 'Rounded'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Episode Behavior Section */}
            <div className="pt-10 border-t border-white/5 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Episode Behavior</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600">Default Player Mode</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['auto', 'audio', 'video'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => updateConfig({ playerMode: m as any })}
                                    className={`rounded-xl border py-3 text-[10px] font-black uppercase tracking-widest transition-all ${config.playerMode === m
                                        ? 'border-primary bg-primary/20 text-primary'
                                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700'
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600">Preferences</label>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center justify-between cursor-pointer rounded-xl border border-slate-800 bg-slate-950 p-3 hover:border-slate-700 transition-all">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Sticky Player</span>
                                <input
                                    type="checkbox"
                                    checked={!!config.stickyPlayer}
                                    onChange={(e) => updateConfig({ stickyPlayer: e.target.checked })}
                                    className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-primary focus:ring-primary/20"
                                />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer rounded-xl border border-slate-800 bg-slate-950 p-3 hover:border-slate-700 transition-all">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Clickable Timestamps</span>
                                <input
                                    type="checkbox"
                                    checked={!!config.showTimestamps}
                                    onChange={(e) => updateConfig({ showTimestamps: e.target.checked })}
                                    className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-primary focus:ring-primary/20"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
