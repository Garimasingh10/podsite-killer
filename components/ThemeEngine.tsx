// components/ThemeEngine.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';

export interface ThemeConfig {
    primaryColor?: string;
    backgroundColor?: string;
    foregroundColor?: string;
    accentColor?: string;
    borderColor?: string;
    fontHeading?: string;
    fontBody?: string;
    cornerRadius?: string; // '0px', '8px', '24px'
    layout?: 'netflix' | 'substack' | 'genz';
    imageUrl?: string;
    customFontUrl?: string; // Phase 3.1 Custom Google Font
}

// Ensure the Google Font parser retrieves the family name correctly
function extractGoogleFontFamily(url: string) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('fonts.googleapis.com')) {
            // css2 api: family=Roboto:wght@400
            const familyParams = urlObj.searchParams.getAll('family');
            if (familyParams.length > 0) {
                // Return the first one, unescaped and formatted for CSS
                return `'${familyParams[0].split(':')[0].replace(/\+/g, ' ')}', sans-serif`;
            }
        }
    } catch {
        return null;
    }
    return null;
}

export default function ThemeEngine({ config: initialConfig, scope }: { config: ThemeConfig, scope?: string }) {
    const [config, setConfig] = useState<ThemeConfig>(initialConfig);

    useEffect(() => {
        // Sync when parent initialConfig updates (like when saving or on initial load)
        setConfig(initialConfig);
    }, [initialConfig]);

    useEffect(() => {
        // Listen for postMessage from split-screen editor if in an iframe
        if (typeof window !== 'undefined' && window.parent !== window) {
            const handleMessage = (e: MessageEvent) => {
                if (e.data?.type === 'UPDATE_THEME') {
                    setConfig(prev => ({ ...prev, ...e.data.payload }));
                }
            };
            window.addEventListener('message', handleMessage);
            return () => window.removeEventListener('message', handleMessage);
        }
    }, []);

    const cssVariables = useMemo(() => {
        const vars: Record<string, string> = {};

        if (config.primaryColor) vars['--primary-color'] = config.primaryColor;
        if (config.backgroundColor) vars['--bg-color'] = config.backgroundColor;
        if (config.foregroundColor) vars['--fg-color'] = config.foregroundColor;
        if (config.accentColor) vars['--accent-color'] = config.accentColor;
        if (config.borderColor) vars['--border-color'] = config.borderColor;

        let overrideFont = null;
        if (config.customFontUrl) {
            overrideFont = extractGoogleFontFamily(config.customFontUrl);
        }

        if (overrideFont) {
            vars['--font-family-heading'] = overrideFont;
            vars['--font-family-body'] = overrideFont;
        } else {
            if (config.fontHeading) vars['--font-family-heading'] = config.fontHeading;
            if (config.fontBody) vars['--font-family-body'] = config.fontBody;
        }

        if (config.cornerRadius) {
            vars['--radius-base-lg'] = config.cornerRadius;
            const radiusNum = parseInt(config.cornerRadius);
            vars['--radius-base-md'] = `${Math.max(0, radiusNum - 4)}px`;
            vars['--radius-base-sm'] = `${Math.max(0, radiusNum - 8)}px`;
        }

        return Object.entries(vars)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ');
    }, [config]);

    const fontImports = useMemo(() => {
        if (config.customFontUrl) {
            return `@import url('${config.customFontUrl}');`;
        }

        const fontsToImport = new Set<string>();
        if (config.fontHeading) fontsToImport.add(config.fontHeading);
        if (config.fontBody && config.fontBody !== config.fontHeading) {
            fontsToImport.add(config.fontBody);
        }

        if (fontsToImport.size === 0) {
            return `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');`;
        }

        const googleFontBaseUrl = 'https://fonts.googleapis.com/css2?';
        const fontParams = Array.from(fontsToImport)
            .map(font => `family=${encodeURIComponent(font.replace(/ /g, '+'))}:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900`)
            .join('&');

        return `@import url('${googleFontBaseUrl}${fontParams}&display=swap');`;
    }, [config.fontHeading, config.fontBody, config.customFontUrl]);

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
        ${fontImports}
        
        ${scope || ':root'} {
          ${cssVariables}
        }
      `
        }} />
    );
}
