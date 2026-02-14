// components/ThemeEngine.tsx
'use client';

import { useMemo } from 'react';

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
}

export default function ThemeEngine({ config }: { config: ThemeConfig }) {
    const cssVariables = useMemo(() => {
        const vars: Record<string, string> = {};

        if (config.primaryColor) vars['--primary'] = config.primaryColor;
        if (config.backgroundColor) vars['--background'] = config.backgroundColor;
        if (config.foregroundColor) vars['--foreground'] = config.foregroundColor;
        if (config.accentColor) vars['--accent'] = config.accentColor;
        if (config.borderColor) vars['--border'] = config.borderColor;

        if (config.fontHeading) vars['--font-heading'] = config.fontHeading;
        if (config.fontBody) vars['--font-body'] = config.fontBody;

        if (config.cornerRadius) {
            vars['--radius-lg'] = config.cornerRadius;
            const radiusNum = parseInt(config.cornerRadius);
            vars['--radius-md'] = `${Math.max(0, radiusNum - 4)}px`;
            vars['--radius-sm'] = `${Math.max(0, radiusNum - 8)}px`;
        }

        return Object.entries(vars)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ');
    }, [config]);

    const fontImports = useMemo(() => {
        const fontsToImport = new Set<string>();
        if (config.fontHeading) {
            fontsToImport.add(config.fontHeading);
        }
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
    }, [config.fontHeading, config.fontBody]);

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        ${fontImports}
        
        :root {
          ${cssVariables}
        }
      `
            }} />
        </>
    );
}
