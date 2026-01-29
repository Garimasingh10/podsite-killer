// app/(dashboard)/_components/SearchForm.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('q', q);
    else params.delete('q');
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="text"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search podcasts…"
        className="rounded bg-slate-800 px-3 py-2 text-sm text-slate-100"
      />
      <button
        type="submit"
        className="rounded bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-300"
      >
        Search
      </button>
    </form>
  );
}
