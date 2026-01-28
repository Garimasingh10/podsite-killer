// lib/youtube/matchEpisodes.ts
import Fuse from 'fuse.js';
import type { YouTubeVideo } from './fetchUploads';

export type EpisodeForMatch = {
  id: string;
  title: string | null;
  published_at: string | null;
};

export type MatchResult = {
  episodeId: string;
  videoId: string;
  score: number; // 0–1, higher = better
};

export function matchEpisodesToVideos(
  episodes: EpisodeForMatch[],
  videos: YouTubeVideo[],
  maxLinks = 10,
  minSimilarity = 0.55, // medium strict
): MatchResult[] {
  if (!episodes.length || !videos.length) return [];

  const fuse = new Fuse(videos, {
    includeScore: true,
    threshold: 0.35, // a bit loose, but not crazy
    keys: ['title'],
  });

  const results: MatchResult[] = [];

  for (const ep of episodes) {
    if (!ep.title) continue;

    const search = fuse.search(ep.title);
    if (!search.length) continue;

    const best = search[0];
    if (best.score == null) continue;

    const similarity = 1 - best.score;
    if (similarity < minSimilarity) continue;

    results.push({
      episodeId: ep.id,
      videoId: best.item.id,
      score: similarity,
    });

    if (results.length >= maxLinks) break;
  }

  return results;
}
