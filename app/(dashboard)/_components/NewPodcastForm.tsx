// app/(dashboard)/_components/NewPodcastForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function NewPodcastForm() {
  const [rssUrl, setRssUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/podcasts/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rssUrl }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(json.error || 'Import failed');
      return;
    }

    setMessage(
      `Imported podcast ${json.podcastId}, episodes: ${json.episodesProcessed}`,
    );
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-end gap-2 sm:flex-row">
      <input
        type="url"
        required
        placeholder="RSS feed URL"
        value={rssUrl}
        onChange={(e) => setRssUrl(e.target.value)}
        className="w-64 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-400 disabled:opacity-60"
      >
        {loading ? 'Importing…' : 'New podcast'}
      </button>
      {message && (
        <p className="w-full text-right text-xs text-slate-400">{message}</p>
      )}
    </form>
  );
}
