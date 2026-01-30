'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ActivePodcastSync({
  podcastId,
  rssUrl,
  youtubeChannelId,
}: {
  podcastId: string;
  rssUrl: string | null;
  youtubeChannelId: string | null;
}) {
  const [channelId, setChannelId] = useState(youtubeChannelId || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const onSync = async () => {
    if (!channelId) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/youtube-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podcastId,
          channelId,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Sync failed');
      }

      setMessage(
        `Matched ${json.matchedCount} videos from ${json.videosFetched} fetched.`
      );
      router.refresh();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          YouTube Sync
        </label>
        <p className="text-[11px] text-slate-400">
          Link your YouTube channel to automatically match videos to episodes.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Channel ID (e.g. UC123...)"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
        />
        <button
          onClick={onSync}
          disabled={loading || !channelId}
          className="shrink-0 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-cyan-300 hover:shadow-sky-500/40 disabled:opacity-50"
        >
          {loading ? 'Syncing...' : 'Sync YouTube'}
        </button>
      </div>

      {message && (
        <p className={`text-xs ${message.includes('Matched') ? 'text-emerald-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
