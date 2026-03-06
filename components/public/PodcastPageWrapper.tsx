'use client';

import React, { useState } from 'react';
import ThemeEngine from '@/components/ThemeEngine';
import LiveLayoutController from '@/components/dashboard/LiveLayoutController';
import LivePodcastManager from '@/components/public/LivePodcastManager';
import SubscribeModal from '@/components/public/SubscribeModal';

export default function PodcastPageWrapper({ podcast, themeConfig, layoutComponent: LayoutComponent, pageLayout, blockDict }: any) {
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  return (
    <LivePodcastManager initialPodcast={podcast}>
      {(livePodcast: any) => (
        <>
          <ThemeEngine config={themeConfig} />
          <LayoutComponent 
            podcast={livePodcast} 
            onSubscribeClick={() => setIsSubscribeOpen(true)}
          >
            <LiveLayoutController initialLayout={pageLayout} blocks={blockDict} />
          </LayoutComponent>
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
