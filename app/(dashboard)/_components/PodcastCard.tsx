'use client';

import Link from 'next/link';

type Podcast = {
  id: string;
  title: string;
  description: string | null;
  rss_url: string | null;
  youtube_channel_id: string | null;
  theme_config?: {
    imageUrl?: string;
    primaryColor?: string;
  };
};

export function PodcastCard({ podcast }: { podcast: Podcast }) {
  const imageUrl = podcast.theme_config?.imageUrl;
  const primaryColor = podcast.theme_config?.primaryColor || '#10b981';

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 transition-all hover:border-slate-700 hover:shadow-xl"
      style={{ '--podcast-primary': primaryColor } as React.CSSProperties}
    >
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--podcast-primary)]/10 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex gap-4 p-4">
        {/* Podcast Cover Image */}
        {imageUrl && (
          <div className="shrink-0">
            <img
              src={imageUrl}
              alt={podcast.title}
              className="h-20 w-20 rounded-xl object-cover shadow-lg ring-2 ring-slate-800 group-hover:ring-[var(--podcast-primary)]/50 transition-all duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200 line-clamp-1">{podcast.title}</h3>
            {podcast.description && (
              <p className="line-clamp-2 text-xs text-slate-400">
                {podcast.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/podcasts/${podcast.id}/settings`}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Settings
            </Link>
            <Link
              href={`/${podcast.id}`}
              target="_blank"
              className="rounded-lg bg-[var(--podcast-primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--podcast-primary)] transition-colors hover:bg-[var(--podcast-primary)]/20"
            >
              View Site →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
