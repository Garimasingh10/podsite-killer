'use client';

import { useState, useEffect, ReactNode } from 'react';

export default function LiveLayoutController({
  initialLayout,
  blocks,
}: {
  initialLayout: string[];
  blocks: Record<string, ReactNode>;
}) {
  const [layout, setLayout] = useState<string[]>(initialLayout);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_LAYOUT') {
        setLayout(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="flex flex-col">
      {layout.map((blockId) => (
        <div key={blockId}>{blocks[blockId]}</div>
      ))}
    </div>
  );
}
