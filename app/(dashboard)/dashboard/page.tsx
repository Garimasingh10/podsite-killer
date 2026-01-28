// app/(dashboard)/dashboard/page.tsx
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your podcasts and create new ones.
          </p>
        </div>

        <Link
          href="/new"
          className="rounded bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-sky-400"
        >
          New podcast
        </Link>
      </header>

      <section className="rounded-lg border border-slate-800 bg-slate-950 p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-200">
          Your podcasts
        </h2>
        <p className="text-xs text-slate-500">
          You don&apos;t have any podcasts yet. Click &quot;New podcast&quot; to add one.
        </p>
      </section>
    </main>
  );
}
