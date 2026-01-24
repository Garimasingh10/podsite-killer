// app/ui/dashboard-episodes.tsx
'use client';

import { useEffect, useState } from 'react';

type Episode = {
  id: string;
  title: string | null;
  youtube_video_id: string | null;
};

export function DashboardEpisodes({ podcastId }: { podcastId: string }) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/episodes?podcastId=${podcastId}`);
        const json = await res.json();
        setEpisodes(json.episodes || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [podcastId]);

  async function updateYoutube(id: string, youtubeVideoId: string) {
    await fetch(`/api/episodes/${id}/youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtubeVideoId }),
    });
  }

  if (loading) {
    return (
      <p className="mt-6 text-xs text-slate-500">
        Loading episodes…
      </p>
    );
  }

  if (!episodes.length) {
    return (
      <p className="mt-6 text-xs text-slate-500">
        No episodes yet.
      </p>
    );
  }

  return (
    <div className="mt-10 rounded-2xl bg-slate-900 p-6">
      <h3 className="mb-4 text-xs uppercase tracking-widest text-slate-400">
        Episodes (manual YouTube linking)
      </h3>
      <div className="max-h-80 space-y-3 overflow-y-auto text-xs">
        {episodes.map((ep) => (
          <div
            key={ep.id}
            className="flex flex-col gap-2 rounded-lg bg-slate-800 p-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex-1">
              <p className="font-medium text-slate-100">
                {ep.title || ep.id}
              </p>
              {ep.youtube_video_id && (
                <p className="mt-1 text-[10px] text-emerald-400">
                  Linked: {ep.youtube_video_id}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                defaultValue={ep.youtube_video_id || ''}
                placeholder="YouTube Video ID"
                className="w-40 rounded bg-slate-900 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-sky-400"
                onBlur={(e) => updateYoutube(ep.id, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
