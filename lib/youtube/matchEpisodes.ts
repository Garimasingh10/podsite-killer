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

  // Fuse settings: include score, look for title
  const fuse = new Fuse(videos, {
    includeScore: true,
    // Lower threshold = stricter. 0.0 is exact, 1.0 is anything.
    // We relax it to 0.6 to catch partial matches, then filter manually.
    threshold: 0.6,
    keys: ['title'],
    ignoreLocation: true, // matching anywhere in the string is fine
  });

  const results: MatchResult[] = [];
  const MAX_LINKS = 50; // Safety cap

  for (const ep of episodes) {
    if (!ep.title) continue;

    const matches = fuse.search(ep.title);
    if (!matches.length) continue;

    // Find the best candidate among the top matches
    let bestMatch: MatchResult | null = null;

    for (const m of matches) {
      const vid = m.item;
      const score = m.score ?? 1; // Fuse score: 0 is best
      const similarity = 1 - score; // Convert to 0..1 where 1 is best

      // Heuristic:
      // 1. High confidence title match
      const highConfidenceTitle = similarity > 0.8;

      // 2. Medium confidence title match + Date match
      const isDateClose = areDatesClose(ep.published_at, vid.publishedAt, 4); // 4 days tolerance
      const mediumConfidenceTitle = similarity > 0.4;

      const isAccepted = highConfidenceTitle || (mediumConfidenceTitle && isDateClose);

      if (isAccepted) {
        console.log(`   -> MATCH ACCEPTED! (Sim: ${similarity.toFixed(2)}, DateMatch: ${isDateClose})`);
        // Take the one with best similarity (lowest score)
        if (!bestMatch || score < (1 - bestMatch.score)) { // Compare Fuse score (0=best) with 1-similarity (0=best)
          bestMatch = {
            episodeId: ep.id,
            videoId: vid.id,
            score: similarity, // Store similarity (1=best)
          };
        }
      } else {
        // console.log(`   -> Rejected. Best Sim was ${similarity.toFixed(2)} but date gap or sim too low.`);
      }
    }

    if (bestMatch) {
      results.push(bestMatch);
      console.log(`[Sync Debug] Best match for "${ep.title}": Video "${bestMatch.videoId}" with score ${bestMatch.score.toFixed(2)}`);
      if (results.length >= MAX_LINKS) break;
    } else {
      console.log(`[Sync Debug] No match found for episode: "${ep.title}"`);
    }
  }

  return results;
}
