'use client';

import React, { useState, useEffect } from 'react';
import { Youtube, Search, Check, X, AlertCircle, Loader2, PlayCircle, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function VideoSyncPage() {
    const searchParams = useSearchParams();
    const podcastId = searchParams.get('podcastId');

    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingMatches, setPendingMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPendingMatches();
    }, [podcastId]);

    const fetchPendingMatches = async () => {
        setLoading(true);
        try {
            // This API should return episodes with video_sync_status = 'pending'
            const res = await fetch(`/api/video-sync/pending?podcastId=${podcastId}`);
            const data = await res.json();
            setPendingMatches(data.matches || []);
        } catch (err) {
            setError('Failed to load pending matches');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (episodeId: string, videoId: string) => {
        try {
            const res = await fetch('/api/video-sync/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ episodeId, videoId })
            });
            if (res.ok) {
                setPendingMatches(prev => prev.filter(m => m.episodeId !== episodeId));
            }
        } catch (err) {
            alert('Failed to confirm match');
        }
    };

    const handleReject = async (episodeId: string) => {
        try {
            const res = await fetch('/api/video-sync/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ episodeId })
            });
            if (res.ok) {
                setPendingMatches(prev => prev.filter(m => m.episodeId !== episodeId));
            }
        } catch (err) {
            alert('Failed to reject match');
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setError('');
        try {
            const res = await fetch('/api/video-sync/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ podcastId })
            });
            const data = await res.json();
            if (data.success) {
                // Refresh matches
                await fetchPendingMatches();
            } else {
                setError(data.error || 'Sync failed');
            }
        } catch (err) {
            setError('Network error during sync');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="space-y-12 pb-20 max-w-5xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20 mb-2">
                        <Youtube size={12} />
                        Sync Engine
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        YouTube Video Sync
                    </h1>
                    <p className="text-slate-400 font-medium tracking-tight">
                        Match your podcast episodes with their YouTube video versions.
                    </p>
                </div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                >
                    {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {isSyncing ? 'Scanning YouTube...' : 'Run Auto‑Sync'}
                </button>
            </div>

            {/* Pending Matches Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Suggested Matches</h2>
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] font-bold text-slate-600 italic bg-white/5 px-2 py-0.5 rounded-full">
                        {pendingMatches.length} Pending
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-50">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Searching for matches...</p>
                    </div>
                ) : pendingMatches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 border border-white/5 rounded-[2rem] text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-slate-700">
                            <Check size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-400">All caught up!</h3>
                        <p className="text-xs text-slate-600 max-w-xs mx-auto">No new videos found that need matching. Try running Auto-Sync if you just uploaded a new video.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {pendingMatches.map((match) => (
                            <div key={match.episodeId} className="group relative bg-slate-900/50 border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-xl hover:border-white/10 transition-all p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                                {/* Episode Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Podcast Episode</span>
                                        <h3 className="text-xl font-bold text-white tracking-tight">{match.episodeTitle}</h3>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span>Published: {new Date(match.episodeDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Match Arrow */}
                                <div className="hidden md:flex flex-col items-center text-primary/30">
                                    <div className="text-[10px] font-black italic mb-2 tracking-tighter">{Math.round(match.confidence * 100)}% Match</div>
                                    <ArrowRight size={24} strokeWidth={3} />
                                </div>

                                {/* Video Suggestion */}
                                <div className="flex-1 w-full flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
                                    <div className="relative h-20 aspect-video rounded-lg overflow-hidden bg-slate-800 shrink-0">
                                        {match.videoThumbnail && <img src={match.videoThumbnail} className="w-full h-full object-cover" />}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PlayCircle size={24} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-1 overflow-hidden">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 italic flex items-center gap-1">
                                            <Youtube size={10} /> YouTube Video
                                        </span>
                                        <h4 className="text-sm font-bold text-slate-200 truncate">{match.videoTitle}</h4>
                                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                                            ID: {match.videoId}
                                            <a href={`https://youtube.com/watch?v=${match.videoId}`} target="_blank" className="hover:text-primary transition-colors"><ExternalLink size={10} /></a>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex md:flex-col gap-3 shrink-0">
                                    <button
                                        onClick={() => handleConfirm(match.episodeId, match.videoId)}
                                        className="h-12 w-12 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg shadow-emerald-500/20"
                                        title="Confirm Match"
                                    >
                                        <Check size={24} strokeWidth={3} />
                                    </button>
                                    <button
                                        onClick={() => handleReject(match.episodeId)}
                                        className="h-12 w-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                        title="Wrong Match"
                                    >
                                        <X size={24} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Manual Search Section */}
            <section className="pt-20 border-t border-white/5">
                <div className="max-w-xl mx-auto text-center space-y-6">
                    <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Missing a video?</h3>
                    <p className="text-sm text-slate-400 font-medium">If the AI missed a match, you can manually search for a YouTube video and link it to an episode.</p>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search YouTube or paste URL..."
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl px-12 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
