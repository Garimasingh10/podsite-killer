// components/blocks/GridBlock.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { useLayout } from '../LayoutContext';

function stripHtml(html: string | null | undefined): string {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
}

export default function GridBlock({ podcast, episodes }: { podcast: any; episodes: any[] }) {
    const layout = useLayout();

    // Regardless of visual theme (netflix / substack / genz),
    // render episodes as a simple list/table with:
    // - title (clickable)
    // - description (from RSS if available)
    // - published date/time
    // - option to \"play\" (go to episode detail page)

    const heading =
        layout === 'substack'
            ? 'Episodes'
            : layout === 'genz'
            ? 'Episode Archive'
            : `Episodes from ${podcast.title}`;

    return (
        <section className="mb-20">
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-zinc-400">
                {heading}
            </h3>

            {episodes.length === 0 ? (
                <p className="text-sm text-zinc-500">No episodes yet.</p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/60">
                    <table className="min-w-full text-left text-sm text-zinc-200">
                        <thead className="border-b border-zinc-800 bg-zinc-900 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                            <tr>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3 hidden md:table-cell">Description</th>
                                <th className="px-4 py-3 w-44 text-right">Published</th>
                                <th className="px-4 py-3 w-32 text-right">Play</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {episodes.map((ep) => {
                                const href = ep.slug
                                    ? `/${podcast.id}/episodes/${ep.slug}`
                                    : `/${podcast.id}`;
                                const plainDescription = stripHtml(ep.description).slice(0, 160);
                                return (
                                    <tr key={ep.id} className="hover:bg-zinc-900/80">
                                        <td className="px-4 py-3 align-top">
                                            {ep.slug ? (
                                                <Link
                                                    href={href}
                                                    className="font-semibold text-zinc-50 hover:underline"
                                                >
                                                    {ep.title || '(Untitled episode)'}
                                                </Link>
                                            ) : (
                                                <span className="font-semibold text-zinc-50">
                                                    {ep.title || '(Untitled episode)'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 align-top hidden md:table-cell">
                                            {plainDescription ? (
                                                <p className="max-w-xl text-xs text-zinc-400">
                                                    {plainDescription}
                                                    {ep.description &&
                                                        ep.description.length > plainDescription.length &&
                                                        '…'}
                                                </p>
                                            ) : (
                                                <span className="text-xs text-zinc-500">
                                                    No description.
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 align-top text-right text-xs text-zinc-400">
                                            {ep.published_at
                                                ? new Date(ep.published_at).toLocaleString(undefined, {
                                                      dateStyle: 'medium',
                                                      timeStyle: 'short',
                                                  })
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3 align-top text-right">
                                            {ep.slug ? (
                                                <Link
                                                    href={href}
                                                    className="inline-flex items-center rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-black hover:bg-sky-400"
                                                >
                                                    ▶ Play
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-zinc-500">Not playable</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
