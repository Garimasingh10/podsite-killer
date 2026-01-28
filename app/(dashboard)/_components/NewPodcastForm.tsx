// app/(dashboard)/_components/NewPodcastForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function NewPodcastForm() {
  const [rssUrl, setRssUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!rssUrl) {
      setMessage('Please paste an RSS feed URL.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/podcasts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rssUrl }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || 'Import failed');
      } else {
        setMessage('Import successful. Podcast and episodes created.');
        setRssUrl('');
        router.refresh();
      }
    } catch (err: any) {
      setMessage(err?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="url"
        placeholder="Paste RSS feed URL"
        value={rssUrl}
        onChange={(e) => setRssUrl(e.target.value)}
        className="flex-1 rounded bg-slate-800 px-3 py-2 text-sm text-slate-100"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-300 disabled:opacity-60"
      >
        {loading ? 'Importing…' : 'New podcast'}
      </button>
      {message && (
        <p className="text-xs text-slate-300">{message}</p>
      )}
    </form>
  );
}
