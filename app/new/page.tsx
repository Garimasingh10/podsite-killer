// app/new/page.tsx
import { NewPodcastForm } from '../(dashboard)/_components/NewPodcastForm';

export default function NewPodcastPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-8 font-sans">
      <h1 className="mb-4 text-2xl font-semibold">New podcast</h1>
      <p className="mb-4 text-sm text-slate-400">
        Paste your podcast RSS feed URL. Example: https://feeds.simplecast.com/54nAGcIl
      </p>
      <NewPodcastForm />
    </main>
  );
}
