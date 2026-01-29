'use client';

import Link from 'next/link';

type Podcast = {
  id: string;
  title: string;
  description: string | null;
  rss_url: string | null;
  youtube_channel_id: string | null;
};

export function PodcastCard({ podcast }: { podcast: Podcast }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{podcast.title}</p>
          {podcast.description && (
            <p className="line-clamp-2 text-[11px] text-slate-400">
              {podcast.description}
            </p>
          )}
          {podcast.rss_url && (
            <p className="break-all text-[11px] text-slate-500">
              RSS: {podcast.rss_url}
            </p>
          )}
        </div>
        <Link
          href={`/${podcast.id}`} // public route
          className="text-[11px] font-medium text-sky-400 hover:underline"
        >
          View site
        </Link>
      </div>
    </div>
  );
}
