'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  podcastId: string;
  rssUrl: string | null;
  youtubeChannelId: string | null;
};

export function ActivePodcastSync({
  podcastId,
  rssUrl,
  youtubeChannelId,
}: Props) {
  const router = useRouter();
  const [rssLoading, setRssLoading] = useState(false);
  const [rssMessage, setRssMessage] = useState('');
  const [channelId, setChannelId] = useState(youtubeChannelId ?? '');
  const [ytLoading, setYtLoading] = useState(false);
  const [ytMessage, setYtMessage] = useState('');

  const handleSyncRss = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rssUrl) {
      setRssMessage('No RSS URL set for this podcast.');
      return;
    }
    setRssLoading(true);
    setRssMessage('');
    try {
      const res = await fetch('/api/rss-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rssUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setRssMessage(`Synced. ${data.episodesProcessed ?? 0} episodes processed.`);
      router.refresh();
    } catch (err: any) {
      setRssMessage(err.message || 'Sync failed');
    } finally {
      setRssLoading(false);
    }
  };

  const handleSyncYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    setYtLoading(true);
    setYtMessage('');
    try {
      const res = await fetch('/api/youtube-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podcastId,
          youtubeChannelId: channelId.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setYtMessage(`Synced. Matched ${data.matchedCount ?? 0} episodes.`);
      router.refresh();
    } catch (err: any) {
      setYtMessage(err.message || 'Sync failed');
    } finally {
      setYtLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4 border-t border-slate-800 pt-4">
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">
          Audio from RSS
        </p>
        <form onSubmit={handleSyncRss} className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={rssLoading || !rssUrl}
            className="rounded bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-sky-400 disabled:opacity-50"
          >
            {rssLoading ? 'Syncing…' : 'Sync RSS'}
          </button>
          {rssMessage && (
            <span className="text-xs text-slate-400">{rssMessage}</span>
          )}
        </form>
      </div>
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">
          YouTube channel ID (UC…)
        </p>
        <form
          onSubmit={handleSyncYoutube}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            type="text"
            placeholder="UCxxxxxxxxxxxxxxxx"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="w-56 rounded bg-slate-800 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={ytLoading || !channelId.trim()}
            className="rounded bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-sky-400 disabled:opacity-50"
          >
            {ytLoading ? 'Syncing…' : 'Sync YouTube'}
          </button>
          {ytMessage && (
            <span className="text-xs text-slate-400">{ytMessage}</span>
          )}
        </form>
      </div>
    </div>
  );
}
