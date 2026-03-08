'use client';

import React, { useState, useMemo } from 'react';
import ThemeEngine from '@/components/ThemeEngine';
import NetflixLayout from '@/components/layouts/NetflixLayout';
import SubstackLayout from '@/components/layouts/SubstackLayout';
import GenZLayout from '@/components/layouts/GenZLayout';
import LiveLayoutController from '@/components/dashboard/LiveLayoutController';
import LivePodcastManager from '@/components/public/LivePodcastManager';
import SubscribeModal from '@/components/public/SubscribeModal';

export default function PodcastPageWrapper({ 
  podcast, 
  themeConfig: initialThemeConfig, 
  layoutComponent: initialLayoutComponent, 
  pageLayout, 
  blockDict 
}: any) {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [themeConfig, setThemeConfig] = useState(initialThemeConfig);
  
  // Decide which layout component to use based on the live themeConfig
  const CurrentLayout = useMemo(() => {
    const layout = themeConfig.layout || 'netflix';
    if (layout === 'substack') return SubstackLayout;
    if (layout === 'genz') return GenZLayout;
    return NetflixLayout;
  }, [themeConfig.layout]);

  return (
    <LivePodcastManager initialPodcast={podcast}>
      {(livePodcast: any) => (
        <>
          <ThemeEngine 
            config={themeConfig} 
            onConfigChange={(newConfig) => setThemeConfig(newConfig)} 
          />
          <CurrentLayout 
            podcast={livePodcast} 
            onSubscribeClick={() => setIsSubscribeOpen(true)}
          >
            <LiveLayoutController initialLayout={pageLayout} blocks={blockDict} />
          </CurrentLayout>
          <SubscribeModal 
            isOpen={isSubscribeOpen} 
            onClose={() => setIsSubscribeOpen(false)} 
            podcastTitle={livePodcast.title} 
          />
        </>
      )}
    </LivePodcastManager>
  );
}
