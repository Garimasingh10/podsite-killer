'use client';

import React, { useState } from 'react';
import { MatchResult } from '@/lib/youtube/fuzzyMatcher';
import { approveMatch } from '../actions';
import { Check, X, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VideoSyncClient({
    matches,
    unmatchedEpisodes
}: {
    matches: MatchResult[];
    unmatchedEpisodes: any[];
}) {
    const [pendingMatches, setPendingMatches] = useState(matches);
    const [isProcessing, setIsProcessing] = useState(false);
    const [manualVideoIds, setManualVideoIds] = useState<Record<string, string>>({});
    const router = useRouter();

    const handleApprove = async (match: MatchResult) => {
        setIsProcessing(true);
        try {
            await approveMatch(match.episodeId, match.videoId);
            setPendingMatches(prev => prev.filter(m => m.episodeId !== match.episodeId));
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = (match: MatchResult) => {
        setPendingMatches(prev => prev.filter(m => m.episodeId !== match.episodeId));
    };

    const handleApproveAll = async () => {
        setIsProcessing(true);
        try {
            for (const match of pendingMatches) {
                await approveMatch(match.episodeId, match.videoId);
            }
            setPendingMatches([]);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleManualLink = async (episodeId: string) => {
        const videoId = manualVideoIds[episodeId];
        if (!videoId) return;

        // rudimentary extraction of ID from URL
        let cleanId = videoId;
        if (videoId.includes('v=')) {
            const match = videoId.match(/[?&]v=([^&]+)/);
            if (match) cleanId = match[1];
        } else if (videoId.includes('youtu.be/')) {
            const match = videoId.match(/youtu\.be\/([^?]+)/);
            if (match) cleanId = match[1];
        }

        setIsProcessing(true);
        try {
            await approveMatch(episodeId, cleanId);
            setManualVideoIds(prev => {
                const next = { ...prev };
                delete next[episodeId];
                return next;
            });
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-12">
            {/* AI Matches */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="bg-primary/20 text-primary p-1 rounded">✨</span>
                            Algorithm Suggestions
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Found {pendingMatches.length} highly probable matches.</p>
                    </div>
                    {pendingMatches.length > 0 && (
                        <button
                            onClick={handleApproveAll}
                            disabled={isProcessing}
                            className="bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            Approve All
                        </button>
                    )}
                </div>

                {pendingMatches.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                        No pending matches found.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {pendingMatches.map((match) => (
                            <div key={match.episodeId} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-slate-900/50 border border-slate-800 p-5 rounded-2xl transition-all hover:border-slate-700">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-sky-500/10 text-sky-500 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border border-sky-500/20">Audio</div>
                                        <p className="text-sm font-semibold text-slate-200 line-clamp-2">{match.episodeTitle}</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border border-red-500/20">Video</div>
                                        <p className="text-sm font-semibold text-slate-200 line-clamp-2">{match.videoTitle}</p>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        {match.matchReasons.map((reason, i) => (
                                            <span key={i} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">
                                                {reason}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 sm:flex-col shrink-0">
                                    <button
                                        onClick={() => handleApprove(match)}
                                        disabled={isProcessing}
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                    >
                                        <Check size={14} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(match)}
                                        disabled={isProcessing}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                    >
                                        <X size={14} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Manual Linking Fallback */}
            <div className="space-y-6 pt-8 border-t border-slate-800">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertCircle size={20} className="text-slate-500" />
                        Unmapped Episodes
                    </h2>
                    <p className="text-sm text-slate-400">These episodes couldn't be automatically mapped. Paste a YouTube ID or URL to link them manually.</p>
                </div>

                {unmatchedEpisodes.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                        All imported episodes have been mapped to videos!
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {unmatchedEpisodes.map((ep) => (
                            <div key={ep.id} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-200 truncate">{ep.title}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                                        Published {new Date(ep.published_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex sm:w-72 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Paste YouTube ID or URL"
                                        value={manualVideoIds[ep.id] || ''}
                                        onChange={(e) => setManualVideoIds(prev => ({ ...prev, [ep.id]: e.target.value }))}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                                    />
                                    <button
                                        onClick={() => handleManualLink(ep.id)}
                                        disabled={isProcessing || !manualVideoIds[ep.id]}
                                        className="bg-primary text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-primary/90 transition-colors"
                                    >
                                        <LinkIcon size={14} /> Link
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
