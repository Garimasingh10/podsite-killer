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

// Helper: Check if dates are within 2 days of each other
function areDatesClose(d1: string | null, d2: string | null, days = 2): boolean {
  if (!d1 || !d2) return false;
  const date1 = new Date(d1).getTime();
  const date2 = new Date(d2).getTime();
  if (isNaN(date1) || isNaN(date2)) return false;

  const diff = Math.abs(date1 - date2);
  const msInDay = 1000 * 60 * 60 * 24;
  return diff <= msInDay * days;
}

export function matchEpisodesToVideos(
  episodes: EpisodeForMatch[],
  videos: YouTubeVideo[],
): MatchResult[] {
  if (!episodes.length || !videos.length) return [];

  // Fuse settings for multi-field search
  const fuse = new Fuse(videos, {
    includeScore: true,
    threshold: 0.6,
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'description', weight: 0.3 }
    ],
    ignoreLocation: true,
  });

  const results: MatchResult[] = [];
  const MAX_LINKS = 100;

  for (const ep of episodes) {
    if (!ep.title) continue;

    const matches = fuse.search(ep.title);
    if (!matches.length) continue;

    let bestMatch: MatchResult | null = null;

    for (const m of matches) {
      const vid = m.item;
      const score = m.score ?? 1;
      const similarity = 1 - score;

      const isDateClose = areDatesClose(ep.published_at, vid.publishedAt, 7); // 7 day tolerance

      // Multi-stage criteria:
      // A) High similarity title match (>0.75)
      // B) Medium similarity (>0.3) + Close date
      // C) Topic Discovery: High similarity in description or partial title match

      const strongTitleMatch = similarity > 0.75;
      const probableMatch = similarity > 0.3 && isDateClose;
      const topicMatch = similarity > 0.5 && vid.description.toLowerCase().includes(ep.title.toLowerCase().slice(0, 15));

      if (strongTitleMatch || probableMatch || topicMatch) {
        // Boost similarity if dates match
        const finalSimilarity = isDateClose ? Math.min(1, similarity + 0.2) : similarity;

        if (!bestMatch || finalSimilarity > bestMatch.score) {
          bestMatch = {
            episodeId: ep.id,
            videoId: vid.id,
            score: finalSimilarity,
          };
        }
      }
    }

    if (bestMatch) {
      results.push(bestMatch);
      if (results.length >= MAX_LINKS) break;
    }
  }

  return results;
}
