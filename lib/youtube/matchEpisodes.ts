// lib/youtube/matchEpisodes.ts
import type { YoutubeVideo } from './fetchChannelVideos';

type Episode = {
  id: string;
  title: string | null;
};

function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function similarity(a: string, b: string) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;

  const setA = new Set(na.split(' '));
  const setB = new Set(nb.split(' '));

  const intersection = [...setA].filter((w) => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;

  return union === 0 ? 0 : intersection / union;
}

export function matchEpisodesToVideos(
  episodes: Episode[],
  videos: YoutubeVideo[],
  threshold = 0.4,
): { episodeId: string; videoId: string }[] {
  const matches: { episodeId: string; videoId: string }[] = [];

  for (const ep of episodes) {
    if (!ep.title) continue;

    let bestScore = 0;
    let bestVideo: YoutubeVideo | null = null;

    for (const video of videos) {
      const score = similarity(ep.title, video.title);
      if (score > bestScore) {
        bestScore = score;
        bestVideo = video;
      }
    }

    if (bestVideo && bestScore >= threshold) {
      matches.push({ episodeId: ep.id, videoId: bestVideo.videoId });
    }
  }

  return matches;
}
