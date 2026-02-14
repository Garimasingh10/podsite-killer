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

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
        :root {
          ${cssVariables}
        }
      `
        }} />
    );
}
