// lib/rss/parseRss.ts
import Parser from 'rss-parser';

type RssItem = {
  title?: string;
  link?: string;
  guid?: string;
  isoDate?: string;
  pubDate?: string;
  enclosure?: { url?: string; length?: string; type?: string };
  'content:encoded'?: string;
  content?: string;
  itunes?: {
    image?: string;
    duration?: string;
  };
  itunes_image?: { href?: string };
};

type ParsedEpisode = {
  guid: string;
  title: string;
  description: string | null;
  audio_url: string | null;
  publish_date: string | null;
  duration_seconds: number | null;
  episode_image_url: string | null;
};

export async function parseRss(url: string): Promise<{
  title: string | null;
  description: string | null;
  image: string | null;
  episodes: ParsedEpisode[];
}> {
  const parser: Parser<any, RssItem> = new Parser({
    customFields: {
      item: [
        'content:encoded',
        ['itunes:image', 'itunes_image'],
        ['itunes:duration', 'itunes_duration'],
      ],
    },
  });

  const feed = await parser.parseURL(url);

  const title = feed.title ?? null;
  const description = (feed.description as string | undefined) ?? null;
  const image =
    (feed.image?.url as string | undefined) ??
    (feed.itunes?.image as string | undefined) ??
    null;

  const episodes: ParsedEpisode[] = (feed.items ?? []).map((item: RssItem) => {
    const guid =
      item.guid ||
      item.link ||
      item.title ||
      // last‑chance fallback, but usually guid/link/title exist
      crypto.randomUUID();

    const desc =
      (item['content:encoded'] as string | undefined) ??
      (item.content as string | undefined) ??
      null;

    const enclosureUrl = item.enclosure?.url ?? null;
    const publishDate = (item.isoDate || item.pubDate) ?? null;

    // duration: from itunes:duration or custom field
    const durationStr =
      (item as any).itunes_duration ||
      (item.itunes as any)?.duration ||
      null;
    let durationSeconds: number | null = null;

    if (durationStr && typeof durationStr === 'string') {
      const parts = durationStr.split(':').map((p) => parseInt(p, 10));
      if (parts.every((n) => !Number.isNaN(n))) {
        if (parts.length === 3) {
          durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          durationSeconds = parts[0] * 60 + parts[1];
        } else if (parts.length === 1) {
          durationSeconds = parts[0];
        }
      }
    }

    const episodeImage =
      (item.itunes_image?.href as string | undefined) ??
      (item.itunes as any)?.image ??
      null;

    return {
      guid: String(guid),
      title: item.title ?? 'Untitled episode',
      description: desc,
      audio_url: enclosureUrl,
      publish_date: publishDate,
      duration_seconds: durationSeconds,
      episode_image_url: episodeImage,
    };
  });

  return { title, description, image, episodes };
}
