// lib/youtube/fuzzyMatcher.ts

export type EpisodeInput = {
    id: string;
    title: string;
    published_at: string | null;
};

export type YoutubeVideoInput = {
    id: string;
    title: string;
    publishedAt: string; // YouTube date format
    thumbnails?: Record<string, {
        url: string;
        width: number;
        height: number;
    }>;
};

export type MatchResult = {
    episodeId: string;
    episodeTitle: string;
    videoId: string;
    videoTitle: string;
    confidence: number;
    matchReasons: string[];
};

const STOP_WORDS = new Set([
    'the', 'and', 'a', 'an', 'in', 'on', 'at', 'with', 'to', 'for', 'of', 'from', 'is', 'it', 'this', 'that', 'episode', 'ep', 'podcast', 'video', 'show', 'audio', 'hq', 'official', 'hd', 'part', 'pt'
]);

function getSignificantWords(text: string): string[] {
    if (!text) return [];
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 0 && !STOP_WORDS.has(w));
    return Array.from(new Set(words));
}

export function fuzzyMatchEpisodesToVideos(
    episodes: EpisodeInput[],
    videos: YoutubeVideoInput[]
): MatchResult[] {
    const matches: MatchResult[] = [];
    const matchedVideoIds = new Set<string>();

    for (const ep of episodes) {
        if (!ep.published_at || !ep.title) continue;

        const epDate = new Date(ep.published_at).getTime();
        const epWords = getSignificantWords(ep.title);

        // Extract episode number if present (e.g., "Ep 42", "Episode 105", "#12")
        const epNumberMatch = ep.title.match(/(?:ep|episode|#)\s*(\d+)/i);
        const epNumber = epNumberMatch ? epNumberMatch[1] : null;

        let bestMatch: { videoId: string; videoTitle: string; score: number; reasons: string[] } | null = null;

        for (const vid of videos) {
            if (matchedVideoIds.has(vid.id)) continue;

            const vidDate = new Date(vid.publishedAt).getTime();
            const dateDiffHours = Math.abs(epDate - vidDate) / (1000 * 60 * 60);

            // Logic 1: Date Check (Within 72 hours - slightly wider window for flexibility)
            if (dateDiffHours <= 72) {
                const vidWords = getSignificantWords(vid.title);
                if (epWords.length === 0 || vidWords.length === 0) continue;

                // Logic 2: Episode Number Match (High Priority)
                if (epNumber) {
                    const vidNumberMatch = vid.title.match(/(?:ep|episode|#)\s*(\d+)/i);
                    const vidNumber = vidNumberMatch ? vidNumberMatch[1] : null;

                    // If both have numbers and they DON'T match, skip this video entirely
                    if (vidNumber && vidNumber !== epNumber) continue;
                }

                // Logic 3: Title Similarity (100% Related Requirement)
                const cleanVidTitle = vid.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
                const cleanEpTitle = ep.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
                
                let score = 0;
                let reason = 'Title similarity';

                // Check for pure substring match first (strongest indicator)
                if (cleanVidTitle.includes(cleanEpTitle) || cleanEpTitle.includes(cleanVidTitle)) {
                    score = 1.0;
                    reason = 'Exact title match (100%)';
                } else {
                    // Fallback to strict word array checking
                    let matchCount = 0;
                    for (const word of epWords) {
                        if (vidWords.includes(word)) matchCount++;
                    }
                    score = matchCount / Math.max(1, epWords.length);
                }

                // ACCURACY UPGRADE: Enforce Near 100% threshold as requested by user
                if (score >= 0.95) {
                    if (!bestMatch || score > bestMatch.score) {
                        bestMatch = {
                            videoId: vid.id,
                            videoTitle: vid.title,
                            score,
                            reasons: [
                                `Confidence: ${Math.round(score * 100)}%`,
                                epNumber ? `Episode #${epNumber} verification` : reason
                            ]
                        };
                    }
                }
            }
        }

        if (bestMatch) {
            matches.push({
                episodeId: ep.id,
                episodeTitle: ep.title,
                videoId: bestMatch.videoId,
                videoTitle: bestMatch.videoTitle,
                confidence: bestMatch.score,
                matchReasons: bestMatch.reasons
            });
            matchedVideoIds.add(bestMatch.videoId);
        }
    }

    return matches;
}
