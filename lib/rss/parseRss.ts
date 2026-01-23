import Parser from 'rss-parser';

type EpisodeItem = {
  guid: string;
  title: string;
  enclosureUrl?: string;
  content?: string;
  imageUrl?: string;
  pubDate?: string;
};

const parser = new Parser<any, EpisodeItem>();

export async function fetchRssEpisodes(rssUrl: string) {
  const feed = await parser.parseURL(rssUrl);

  const episodes: EpisodeItem[] = feed.items.map((item: any) => ({
    guid: item.guid ?? item.id ?? item.link,
    title: item.title,
    enclosureUrl: item.enclosure?.url,
    content: item['content:encoded'] ?? item.content,
    imageUrl:
      item.itunes?.image ?? item['itunes:image']?.href ?? feed.image?.url,
    pubDate: item.pubDate,
  }));

  return {
    title: feed.title,
    description: feed.description,
    image: feed.image?.url,
    episodes,
  };
}
