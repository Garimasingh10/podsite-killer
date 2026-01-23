// app/ui/dashboard-root.tsx
'use client';

import { useEffect, useState } from 'react';

type Podcast = {
  id: string;
  title: string | null;
  description: string | null;
  rss_url: string | null;
};

export default function DashboardRoot() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [youtubeChannelId, setYoutubeChannelId] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard/podcasts');
        const json = await res.json();
        setPodcasts(json.podcasts || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function syncRss(podcastId: string) {
    setMessage('Syncing RSS…');
    try {
      const res = await fetch('/api/cron/rss', { method: 'GET' });
      const json = await res.json();
      setMessage(`RSS sync: ${json.message || 'ok'}`);
    } catch (e) {
      console.error(e);
      setMessage('RSS sync failed');
    }
  }

  async function syncYoutube(podcastId: string) {
    const channelId = youtubeChannelId[podcastId];
    if (!channelId) {
      setMessage('Enter YouTube Channel ID first');
      return;
    }

    setMessage('Syncing YouTube…');
    try {
      const res = await fetch('/api/youtube-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podcastId, youtubeChannelId: channelId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(`YouTube sync error: ${json.error || 'unknown'}`);
      } else {
        setMessage(`YouTube sync ok. Matches: ${json.matchesCount}`);
      }
    } catch (e) {
      console.error(e);
      setMessage('YouTube sync failed');
    }
  }

  if (loading) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h1>PodSite‑Killer – Dashboard</h1>
        <p>Loading podcasts…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>PodSite‑Killer – Dashboard</h1>

      {message && <p>{message}</p>}

      {podcasts.length === 0 ? (
        <p>No podcasts yet.</p>
      ) : (
        <ul>
          {podcasts.map((p) => (
            <li key={p.id} style={{ marginBottom: '1.5rem' }}>
              <h2>{p.title || p.id}</h2>
              {p.description && <p>{p.description}</p>}
              {p.rss_url && <p>RSS: {p.rss_url}</p>}
              <p>
                <a href={`/${p.id}`}>Open public page</a>
              </p>

              <button onClick={() => syncRss(p.id)}>Sync RSS now</button>

              <div style={{ marginTop: '0.5rem' }}>
                <input
                  placeholder="YouTube Channel ID"
                  value={youtubeChannelId[p.id] || ''}
                  onChange={(e) =>
                    setYoutubeChannelId((prev) => ({
                      ...prev,
                      [p.id]: e.target.value,
                    }))
                  }
                />
                <button onClick={() => syncYoutube(p.id)}>Sync YouTube</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
