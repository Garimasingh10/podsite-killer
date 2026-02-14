// app/(dashboard)/_components/SearchForm.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export function SearchForm({
  initialQuery,
  placeholder = "Search podcasts...",
  className = ""
}: {
  initialQuery: string;
  placeholder?: string;
  className?: string;
}) {
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
    <form onSubmit={onSubmit} className={`flex gap-3 ${className}`}>
      <input
        type="text"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-5 py-3 text-sm text-zinc-900 dark:text-zinc-100 shadow-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:border-indigo-500/50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
      />
      <button
        type="submit"
        className="rounded-2xl bg-zinc-900 dark:bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-500/10 hover:bg-zinc-800 dark:hover:bg-indigo-500 transition-all active:scale-[0.98]"
      >
        Search
      </button>
    </form>
  );
}
