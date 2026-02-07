'use client';

import React, { useState, useRef, useEffect } from 'react';
import FloatingPlayer from './FloatingPlayer';
import { Play, Video, Headphones, Clock } from 'lucide-react';

interface EpisodePlayerProps {
    youtubeVideoId?: string | null;
    audioUrl?: string | null;
    title: string;
    description: string;
    podcastId: string;
}

export default function EpisodePlayer({ youtubeVideoId, audioUrl, title, description, podcastId }: EpisodePlayerProps) {
    const [mode, setMode] = useState<'video' | 'audio'>(youtubeVideoId ? 'video' : 'audio');
    const audioRef = useRef<HTMLAudioElement>(null);
    const [processedDescription, setProcessedDescription] = useState<string>(description);

    const hasBoth = !!(youtubeVideoId && audioUrl);

    // Function to seek both players
    const seekTo = (seconds: number) => {
        if (mode === 'audio' && audioRef.current) {
            audioRef.current.currentTime = seconds;
            audioRef.current.play();
        } else if (mode === 'video') {
            // For TouTube, we currently use an iframe. 
            // The simplest "Killer" way to jump is to reload the iframe source with ?t=
            // In a more advanced version, we'd use the YT JS API, but this is a solid "Phase 2" MVP jump.
            const iframe = document.querySelector('iframe');
            if (iframe) {
                const currentSrc = new URL(iframe.src);
                currentSrc.searchParams.set('start', seconds.toString());
                currentSrc.searchParams.set('autoplay', '1');
                iframe.src = currentSrc.toString();
            }
        }
    };

    const parseTimestamps = (text: string) => {
        const timestampRegex = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;
        return text.replace(timestampRegex, (match) => {
            const parts = match.split(':').map(Number);
            let seconds = 0;
            if (parts.length === 3) {
                seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            } else {
                seconds = parts[0] * 60 + parts[1];
            }
            // Use a data attribute we can catch with a click listener
            return `<button data-timestamp="${seconds}" class="timestamp-link text-primary font-mono font-bold hover:underline cursor-pointer bg-primary/5 px-1.5 py-0.5 rounded border border-primary/20 transition-all hover:bg-primary/10 inline-flex items-center gap-1 mx-0.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${match}
            </button>`;
        });
    };

    useEffect(() => {
        setProcessedDescription(parseTimestamps(description));
    }, [description]);

    // Handle clicks on generated buttons
    const handleDescClick = (e: React.MouseEvent) => {
        const target = (e.target as HTMLElement).closest('[data-timestamp]');
        if (target) {
            const seconds = parseInt(target.getAttribute('data-timestamp') || '0');
            seekTo(seconds);
        }
    };

    return (
        <div className="space-y-8">
            {/* Toggle Switch */}
            {hasBoth && (
                <div className="flex justify-center">
                    <div className="inline-flex rounded-full bg-slate-900 p-1 border border-slate-800 shadow-xl">
                        <button
                            onClick={() => setMode('video')}
                            className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all ${mode === 'video' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Video size={16} />
                            Watch Video
                        </button>
                        <button
                            onClick={() => setMode('audio')}
                            className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all ${mode === 'audio' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Headphones size={16} />
                            Listen Audio
                        </button>
                    </div>
                </div>
            )}

            {/* Main Player Area */}
            <div className="relative">
                {mode === 'video' && youtubeVideoId && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        <FloatingPlayer youtubeVideoId={youtubeVideoId} title={title} />
                    </div>
                )}

                {mode === 'audio' && audioUrl && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                                <Headphones size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Audio Experience</h4>
                                <p className="text-xs text-slate-500">Immersive stereo audio</p>
                            </div>
                        </div>
                        <audio
                            ref={audioRef}
                            controls
                            src={audioUrl}
                            className="w-full focus:outline-none"
                        >
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
            </div>

            {/* Description / Show Notes */}
            <section className="prose prose-invert max-w-none rounded-2xl border border-slate-800/50 bg-slate-900/20 p-8 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                    <Clock size={20} className="text-primary" />
                    <h3 className="text-xl font-bold m-0">Show Notes & Timestamps</h3>
                </div>
                <div
                    onClick={handleDescClick}
                    className="text-lg leading-relaxed text-slate-400 space-y-4"
                    dangerouslySetInnerHTML={{ __html: processedDescription }}
                />
            </section>
        </div>
    );
}
