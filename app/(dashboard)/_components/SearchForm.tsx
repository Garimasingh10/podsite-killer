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
    <form onSubmit={onSubmit} className={`flex gap-2 ${className}`}>
      <input
        type="text"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
      />
      <button
        type="submit"
        className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm shadow-sky-500/20 hover:bg-sky-400 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
