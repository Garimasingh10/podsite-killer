// app/(dashboard)/_components/PodcastCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

type Podcast = {
  id: string;
  title: string;
  description: string | null;
  rss_url: string | null;
  youtube_channel_id: string | null;
};

export function PodcastCard({ podcast }: { podcast: Podcast }) {
  const [youtubeChannelId, setYoutubeChannelId] = useState(
    podcast.youtube_channel_id ?? '',
  );
  const [syncingYoutube, setSyncingYoutube] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSyncYoutube() {
    if (!youtubeChannelId) {
      setMessage('Enter a YouTube channel ID (UC...) first');
      return;
    }

    setSyncingYoutube(true);
    setMessage(null);

    try {
      const res = await fetch('/api/youtube-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podcastId: podcast.id,
          youtubeChannelId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error || 'YouTube sync failed');
      } else {
        setMessage(`YouTube synced (${json.matchesCount} episodes linked).`);
      }
    } catch (e: any) {
      setMessage(e?.message || 'YouTube sync failed');
    } finally {
      setSyncingYoutube(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{podcast.title}</h2>
        <Link
          href={`/${podcast.id}`}
          className="text-xs font-semibold text-sky-400 hover:underline"
        >
          View public site →
        </Link>
      </div>

      {podcast.description && (
        <p className="mt-1 line-clamp-3 text-sm text-slate-300">
          {podcast.description}
        </p>
      )}

      {podcast.rss_url && (
        <p className="mt-1 text-xs text-slate-500">RSS: {podcast.rss_url}</p>
      )}

      <div className="mt-3 flex flex-col gap-2 text-sm">
        <label className="text-xs text-slate-400">
          YouTube channel ID (UC...)
          <input
            value={youtubeChannelId}
            onChange={(e) => setYoutubeChannelId(e.target.value)}
            className="mt-1 w-full rounded bg-slate-800 px-2 py-1 text-xs"
          />
        </label>

        <button
          onClick={handleSyncYoutube}
          disabled={syncingYoutube}
          className="mt-1 rounded bg-sky-400 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-sky-300 disabled:opacity-60"
        >
          {syncingYoutube ? 'Syncing YouTube…' : 'Sync YouTube'}
        </button>

        {message && (
          <p className="mt-1 text-xs text-slate-300">{message}</p>
        )}
      </div>
    </div>
  );
}
