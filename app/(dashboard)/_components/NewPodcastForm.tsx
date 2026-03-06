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

    // Show success message briefly
    setMessage(
      `Success! Imported "${json.title}" with ${json.episodesProcessed} episodes.`
    );
    setRssUrl('');
    
    // Refresh immediately to show newly imported podcast as active
    // and seamlessly redirect to the customization screen to fulfill onboarding
    setTimeout(() => {
      router.refresh();
      if (json.podcastId) {
        router.push(`/dashboard?active=${json.podcastId}`);
      }
      setMessage(null);
    }, 1000);
  };

  return (
    <>
      <form onSubmit={onSubmit} className="relative flex w-full max-w-lg flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="url"
            required
            placeholder="Paste RSS Url..."
            value={rssUrl}
            onChange={(e) => setRssUrl(e.target.value)}
            disabled={loading}
            className="w-full rounded-2xl border-2 border-white/10 bg-black/40 px-5 py-4 text-sm text-white shadow-inner backdrop-blur-md placeholder:text-zinc-500 focus:border-[var(--podcast-primary)]/50 focus:outline-none focus:ring-4 focus:ring-[var(--podcast-primary)]/10 transition-all font-bold disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-2xl bg-[var(--podcast-primary)] px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-black shadow-2xl hover:scale-[1.05] disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex flex-col items-center">
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing...
              </span>
              <span className="text-[8px] font-medium opacity-50 lowercase tracking-normal mt-0.5">Processing episodes</span>
            </span>
          ) : (
            'Import Show'
          )}
        </button>

        {message && (
          <div className={`absolute top-full left-0 mt-2 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs shadow-xl backdrop-blur-md flex items-center gap-2 ${message.toLowerCase().includes('success') ? 'text-emerald-400 border-emerald-900' : 'text-red-400 border-red-900'
            }`}>
            {message.toLowerCase().includes('success') && (
              <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span>{message}</span>
          </div>
        )}
      </form>
    </>
  );
}
