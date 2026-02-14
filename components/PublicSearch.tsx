'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function PublicSearch({ podcastId, initialQuery = '' }: { podcastId: string, initialQuery?: string }) {
    const [query, setQuery] = useState(initialQuery);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) {
            router.push(`/${podcastId}`);
            return;
        }
        router.push(`/${podcastId}/episodes?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <form onSubmit={handleSearch} className="relative group">
            <input
                type="text"
                placeholder="Search episodes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full md:w-64 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-white">
                <Search size={16} />
            </button>
        </form>
    );
}
