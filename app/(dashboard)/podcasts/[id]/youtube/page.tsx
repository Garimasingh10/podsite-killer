// app/(dashboard)/podcasts/[id]/youtube/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { useState } from 'react';

type PageProps = {
  params: { id: string };
};

export default async function PodcastYouTubeSyncPage({ params }: PageProps) {
  const { id } = params;
  const supabase = createSupabaseServerClient();

  const { data: podcast } = await supabase
    .from('podcasts')
    .select('id, title')
    .eq('id', id)
    .maybeSingle();

  if (!podcast) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p>Podcast not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            YouTube sync – {podcast.title}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Paste your YouTube Channel ID (UCkdnY2hNC0sdlVXPtWuNQ8g).
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-sky-500 hover:underline"
        >
          ← Back to dashboard
        </Link>
      </header>

      <YoutubeSyncForm podcastId={podcast.id} />
    </main>
  );
}

function YoutubeSyncForm({ podcastId }: { podcastId: string }) {
  'use client';

  const [channelId, setChannelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelId) return;

    setLoading(true);
    setMessage(null);

    try {
      // Keeping your old field name so it matches logs:
      const res = await fetch('/api/youtube-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podcastId,
          youtubeChannelId: channelId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          `ERROR: ${data.error || 'YouTube sync failed'} | bodySeenByServer=${JSON.stringify(
            data.bodySeenByServer,
          )}`,
        );
      } else {
        setMessage(
          `OK – received podcastId=${data.receivedPodcastId}, channelId=${data.receivedChannelId}`,
        );
      }
    } catch (err: any) {
      setMessage(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label className="block text-xs font-semibold text-slate-300">
        YouTube Channel ID
      </label>
      <input
        type="text"
        required
        value={channelId}
        onChange={(e) => setChannelId(e.target.value)}
        placeholder="UCkdnY2hNC0sdlVXPtWuNQ8g"
        className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-sky-400 disabled:opacity-60"
      >
        {loading ? 'Syncing…' : 'Sync YouTube'}
      </button>
      {message && (
        <p className="mt-2 text-xs text-slate-400">
          {message}
        </p>
      )}
    </form>
  );
}
