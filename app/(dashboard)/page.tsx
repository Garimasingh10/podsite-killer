// app/(dashboard)/page.tsx
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { PodcastCard } from './_components/PodcastCard';
import { NewPodcastForm } from './_components/NewPodcastForm';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select('id, title, description, rss_url, youtube_channel_id');

  if (error) {
    console.error('dashboard podcasts error', error);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 font-sans">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <NewPodcastForm />
      </div>

      {!podcasts?.length ? (
        <p className="text-sm text-slate-400">No podcasts yet.</p>
      ) : (
        <div className="space-y-4">
          {podcasts.map((podcast) => (
            <PodcastCard key={podcast.id} podcast={podcast} />
          ))}
        </div>
      )}
    </main>
  );
}
