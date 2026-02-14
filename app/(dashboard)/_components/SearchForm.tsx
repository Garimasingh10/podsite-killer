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
        className="flex-1 rounded-2xl border-2 border-white/10 bg-black/40 px-5 py-4 text-sm text-white shadow-inner backdrop-blur-md placeholder:text-zinc-600 focus:border-[var(--podcast-primary)]/50 focus:outline-none focus:ring-4 focus:ring-[var(--podcast-primary)]/10 transition-all font-bold"
      />
      <button
        type="submit"
        className="rounded-2xl bg-[var(--podcast-primary)] px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-black shadow-2xl hover:scale-[1.05] transition-all active:scale-[0.98]"
      >
        Search
      </button>
    </form>
  );
}
