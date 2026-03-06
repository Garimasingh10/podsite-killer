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
                            style={{ 
                                borderRadius: config.cornerRadius || '8px',
                                borderColor: config.layout === l.id ? config.primaryColor : config.primaryColor + '40',
                                backgroundColor: config.layout === l.id ? config.primaryColor + '1A' : config.primaryColor + '0A'
                            }}
                            className={`flex flex-col items-start border-2 p-4 text-left transition-all hover:opacity-80`}
                        >
                            <Layout size={18} className={`mb-2`} style={{ color: config.layout === l.id ? config.primaryColor : config.primaryColor + '80' }} />
                            <span className={`text-sm font-bold transition-colors`} style={{ color: config.layout === l.id ? '#ffffff' : config.primaryColor + 'CC' }}>{l.name}</span>
                            <span className="text-[10px] uppercase tracking-tighter" style={{ color: config.primaryColor + '66' }}>{l.desc}</span>
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
                                    style={{
                                        borderColor: config.primaryColor + '40',
                                        backgroundColor: config.primaryColor + '0A',
                                        color: config.primaryColor + 'CC'
                                    }}
                                    className="group flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold transition-all hover:opacity-80 hover:text-white"
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
                            <div style={{ borderRadius: config.cornerRadius || '8px', borderColor: config.primaryColor + '40', backgroundColor: config.primaryColor + '0A' }} className="flex items-center justify-between border-2 p-2 pl-3 pr-2 transition-all hover:border-[var(--primary)] group">
                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors min-w-0 truncate pr-2 group-hover:opacity-100" style={{ color: config.primaryColor, opacity: 0.7 }}>Primary</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <input
                                        type="text"
                                        value={config.primaryColor || '#0ea5e9'}
                                        onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                                        className="w-[52px] bg-transparent text-right font-mono text-[10px] sm:text-[11px] focus:outline-none transition-colors"
                                        style={{ color: config.primaryColor, opacity: 0.6 }}
                                    />
                                    <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-[4px] bg-slate-800 ring-1 ring-white/10 shadow-lg transition-all group-hover:ring-[var(--primary)]/50">
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
                             <div style={{ borderRadius: config.cornerRadius || '8px', borderColor: config.primaryColor + '40', backgroundColor: config.primaryColor + '0A' }} className="flex items-center justify-between border-2 p-2 pl-3 pr-2 transition-all hover:border-[var(--primary)] group">
                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors min-w-0 truncate pr-2 group-hover:opacity-100" style={{ color: config.primaryColor, opacity: 0.7 }}>Background</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <input
                                        type="text"
                                        value={config.backgroundColor || '#020617'}
                                        onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                                        className="w-[52px] bg-transparent text-right font-mono text-[10px] sm:text-[11px] focus:outline-none transition-colors"
                                        style={{ color: config.primaryColor, opacity: 0.6 }}
                                    />
                                    <div className="relative flex-shrink-0 h-6 w-6 overflow-hidden rounded-[4px] bg-slate-800 ring-1 ring-white/10 shadow-lg transition-all group-hover:ring-[var(--primary)]/50">
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
                            <div style={{ borderRadius: config.cornerRadius || '8px', borderColor: config.primaryColor + '40', backgroundColor: config.primaryColor + '0A' }} className="flex items-center justify-between border-2 p-2 pl-3 pr-2 transition-all hover:border-[var(--primary)] group">
                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors min-w-0 truncate pr-2 group-hover:opacity-100" style={{ color: config.primaryColor, opacity: 0.7 }}>Accent</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <input
                                        type="text"
                                        value={config.accentColor || '#f59e0b'}
                                        onChange={(e) => updateConfig({ accentColor: e.target.value })}
                                        className="w-[52px] bg-transparent text-right font-mono text-[10px] sm:text-[11px] focus:outline-none transition-colors"
                                        style={{ color: config.primaryColor, opacity: 0.6 }}
                                    />
                                    <div className="relative flex-shrink-0 h-6 w-6 overflow-hidden rounded-[4px] bg-slate-800 ring-1 ring-white/10 shadow-lg transition-all group-hover:ring-[var(--primary)]/50">
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
                                    className={`group flex items-center justify-between border-2 p-3.5 transition-all ${config.fontHeading === p.heading && !config.customFontUrl
                                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                                        : 'hover:border-[var(--primary)]/50'
                                        }`}
                                    style={{ 
                                        borderRadius: config.cornerRadius || '8px',
                                        borderColor: (config.fontHeading === p.heading && !config.customFontUrl) ? config.primaryColor : config.primaryColor + '40',
                                        backgroundColor: (config.fontHeading === p.heading && !config.customFontUrl) ? config.primaryColor + '1A' : config.primaryColor + '0A'
                                    }}
                                >
                                    <div className="flex flex-col items-start min-w-0">
                                        <span className={`text-sm font-bold truncate transition-colors`} style={{ color: (config.fontHeading === p.heading && !config.customFontUrl) ? config.primaryColor : config.primaryColor + 'CC' }}>
                                            {p.name}
                                        </span>
                                        <span className="text-[10px] font-bold" style={{ color: config.primaryColor, opacity: 0.6 }}>Standard</span>
                                    </div>
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-all`} style={{ 
                                        borderColor: (config.fontHeading === p.heading && !config.customFontUrl) ? config.primaryColor : config.primaryColor + '40',
                                        color: (config.fontHeading === p.heading && !config.customFontUrl) ? config.primaryColor : config.primaryColor + '80'
                                    }}>
                                        <span className="text-sm font-serif">Aa</span>
                                    </div>
                                </button>
                            ))}

                            <div style={{ 
                                borderRadius: config.cornerRadius || '8px',
                                borderColor: config.customFontUrl ? config.primaryColor : config.primaryColor + '40',
                                backgroundColor: config.customFontUrl ? config.primaryColor + '1A' : config.primaryColor + '0A'
                            }} className={`space-y-3 border-2 p-4 transition-all flex flex-col`}>
                                <label className="block text-[10px] font-black uppercase tracking-widest" style={{ color: config.primaryColor, opacity: 0.7 }}>Custom Font URL</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        placeholder="https://fonts.googleapis.com/..."
                                        value={localFontUrl}
                                        onChange={(e) => setLocalFontUrl(e.target.value)}
                                        style={{ 
                                            borderRadius: config.cornerRadius === '16px' ? '8px' : config.cornerRadius,
                                            backgroundColor: config.primaryColor + '0A',
                                            borderColor: config.primaryColor + '20',
                                            color: config.primaryColor
                                        }}
                                        className="w-full px-3 py-2 text-[10px] focus:outline-none font-mono border-2 focus:border-[var(--primary)]/50 transition-colors"
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
                                        style={{ 
                                            borderRadius: config.cornerRadius === '16px' ? '8px' : config.cornerRadius,
                                            backgroundColor: config.primaryColor,
                                            color: '#000000'
                                        }}
                                        className="w-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 active:scale-95"
                                    >
                                        Apply
                                    </button>
                                </div>
                                <p className="text-[9px] italic px-1 m-0" style={{ color: config.primaryColor, opacity: 0.6 }}>Paste a Google Fonts URL or Font Name.</p>
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
                                    style={{ 
                                        borderRadius: r,
                                        borderColor: config.cornerRadius === r ? config.primaryColor : config.primaryColor + '40',
                                        backgroundColor: config.cornerRadius === r ? config.primaryColor : config.primaryColor + '0A',
                                        color: config.cornerRadius === r ? '#000000' : config.primaryColor + 'B3'
                                    }}
                                    className={`border-2 py-2 px-1 text-[10px] font-black tracking-tighter transition-all ${config.cornerRadius === r
                                        ? 'shadow-[0_0_15px_-3px_var(--primary)] scale-105'
                                        : 'hover:opacity-80 hover:text-white'
                                        }`}
                                >
                                    {r === '0px' ? 'SHARP' : r === '8px' ? 'SOFT' : 'ROUND'}
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
