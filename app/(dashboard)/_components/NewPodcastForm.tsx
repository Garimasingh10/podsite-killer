// app/(dashboard)/_components/NewPodcastForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Link from 'next/link';

type ImportSuccess = {
  podcastId: string;
  title?: string;
  episodesProcessed: number;
} | null;

export function NewPodcastForm({ initialRss = '' }: { initialRss?: string }) {
  const [rssUrl, setRssUrl] = useState(initialRss);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<ImportSuccess>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setImportSuccess(null);

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

    // Show success modal with imported podcast details
    setImportSuccess({
      podcastId: json.podcastId,
      title: json.title,
      episodesProcessed: json.episodesProcessed,
    });
    setRssUrl('');
    
    // Refresh in background without blocking UI
    setTimeout(() => router.refresh(), 1000);
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
            disabled={loading || !!importSuccess}
            className="w-full rounded-2xl border-2 border-white/10 bg-black/40 px-5 py-4 text-sm text-white shadow-inner backdrop-blur-md placeholder:text-zinc-500 focus:border-[var(--podcast-primary)]/50 focus:outline-none focus:ring-4 focus:ring-[var(--podcast-primary)]/10 transition-all font-bold disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !!importSuccess}
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
          <div className={`absolute top-full left-0 mt-2 w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs shadow-xl backdrop-blur-md ${message.toLowerCase().includes('success') ? 'text-emerald-400' : 'text-red-400'
            }`}>
            {message}
          </div>
        )}
      </form>

      {/* Success Modal - Show newly imported podcast */}
      {importSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-3xl border border-[var(--podcast-primary)]/30 bg-gradient-to-b from-slate-900 to-slate-950 p-8 shadow-2xl animate-in scale-in duration-300">
            {/* Close button */}
            <button
              onClick={() => setImportSuccess(null)}
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>

            {/* Success content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-emerald-400">Show Imported Successfully</h3>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Podcast Details</p>
                <div className="rounded-xl bg-white/5 p-4 border border-white/10 space-y-2">
                  <p className="text-sm font-bold text-white">Episodes Synced</p>
                  <p className="text-2xl font-black text-emerald-400">{importSuccess.episodesProcessed}</p>
                  <p className="text-xs text-slate-500">Ready to go live</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Link
                  href={`/${importSuccess.podcastId}`}
                  target="_blank"
                  className="flex-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 py-3 text-center text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                >
                  View Site ↗
                </Link>
                <button
                  onClick={() => setImportSuccess(null)}
                  className="flex-1 rounded-lg bg-[var(--podcast-primary)]/20 border border-[var(--podcast-primary)]/30 py-3 text-sm font-bold text-[var(--podcast-primary)] hover:bg-[var(--podcast-primary)]/30 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
