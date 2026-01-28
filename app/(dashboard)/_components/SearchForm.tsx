// app/(dashboard)/_components/SearchForm.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();
    if (trimmed) {
      params.set('q', trimmed);
    } else {
      params.delete('q');
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2"
    >
      <input
        type="text"
        placeholder="Search podcasts by title"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
      />
      <button
        type="submit"
        className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-100"
      >
        Search
      </button>
    </form>
  );
}
