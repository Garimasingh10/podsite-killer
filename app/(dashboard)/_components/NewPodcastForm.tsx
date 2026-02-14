// app/(dashboard)/_components/NewPodcastForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function NewPodcastForm({ initialRss = '' }: { initialRss?: string }) {
  const [rssUrl, setRssUrl] = useState(initialRss);
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
      `Success! Imported "${json.podcastId}" with ${json.episodesProcessed} episodes.`,
    );
    setRssUrl('');
    router.refresh();

    // Explicitly pushing to dashboard to trigger a full server-side refresh if needed
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 100);

    // Clear success message after 3s
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <form onSubmit={onSubmit} className="relative flex w-full max-w-lg flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <input
          type="url"
          required
          placeholder="Paste RSS Url..."
          value={rssUrl}
          onChange={(e) => setRssUrl(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-5 py-3 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="shrink-0 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/10 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Syncing...
          </span>
        ) : (
          'Import Show'
        )}
      </button>

      {message && (
        <div className={`absolute top-full left-0 mt-2 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs shadow-xl backdrop-blur-md ${message.toLowerCase().includes('success') ? 'text-emerald-400' : 'text-red-400'
          }`}>
          {message}
        </div>
      )}
    </form>
  );
}
