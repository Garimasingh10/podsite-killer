// components/EpisodePlayer.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import FloatingPlayer from './FloatingPlayer';
import { Play, Pause, Video, Headphones, Clock, X } from 'lucide-react';

interface EpisodePlayerProps {
    youtubeVideoId?: string | null;
    audioUrl?: string | null;
    title: string;
    description: string;
    podcastId: string;
}

export default function EpisodePlayer({ youtubeVideoId, audioUrl, title, description }: EpisodePlayerProps) {
    const [mode, setMode] = useState<'video' | 'audio' | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isSticky, setIsSticky] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const hasBoth = !!(youtubeVideoId && audioUrl);

    // Default to a single mode if only one exists
    useEffect(() => {
        if (!mode) {
            if (youtubeVideoId && !audioUrl) setMode('video');
            else if (audioUrl && !youtubeVideoId) setMode('audio');
        }
    }, [youtubeVideoId, audioUrl, mode]);

    // Intersection Observer for Sticky Mode
    useEffect(() => {
        if (mode !== 'audio') {
            setIsSticky(false);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
            },
            { threshold: 0.1, rootMargin: '-100px 0px 0px 0px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [mode]);

    // Sync Audio State
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateState = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration || 0);
            setIsPlaying(!audio.paused);
        };

        audio.addEventListener('timeupdate', updateState);
        audio.addEventListener('play', updateState);
        audio.addEventListener('pause', updateState);
        audio.addEventListener('loadedmetadata', updateState);

        return () => {
            audio.removeEventListener('timeupdate', updateState);
            audio.removeEventListener('play', updateState);
            audio.removeEventListener('pause', updateState);
            audio.removeEventListener('loadedmetadata', updateState);
        };
    }, [mode]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const seekTo = (seconds: number) => {
        if (mode === 'audio' && audioRef.current) {
            audioRef.current.currentTime = seconds;
            audioRef.current.play();
        } else if (mode === 'video') {
            const iframe = document.querySelector('iframe');
            if (iframe) {
                const currentSrc = new URL(iframe.src);
                currentSrc.searchParams.set('start', seconds.toString());
                currentSrc.searchParams.set('autoplay', '1');
                iframe.src = currentSrc.toString();
            }
        }
    };

    const processedDescription = React.useMemo(() => {
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
                return `<button data-timestamp="${seconds}" class="timestamp-link text-primary font-mono font-bold hover:underline cursor-pointer bg-primary/5 px-1.5 py-0.5 rounded border border-primary/20 transition-all hover:bg-primary/10 inline-flex items-center gap-1 mx-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    ${match}
                </button>`;
            });
        };
        return parseTimestamps(description);
    }, [description]);

    const handleDescClick = (e: React.MouseEvent) => {
        const target = (e.target as HTMLElement).closest('[data-timestamp]');
        if (target) {
            const seconds = parseInt(target.getAttribute('data-timestamp') || '0');
            seekTo(seconds);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-8 min-h-[400px]">
            {/* Selection Overlay (Ask: Watch vs Listen) */}
            {hasBoth && mode === null && (
                <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center rounded-3xl border-4 border-foreground bg-accent p-12 text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-8 bg-white px-4 py-2 border-4 border-black -rotate-2">
                        PICK YOUR VIBE
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
                        <button
                            onClick={() => setMode('video')}
                            className="group flex-1 flex flex-col items-center gap-4 rounded-2xl border-4 border-black bg-white p-8 transition-all hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:scale-95"
                        >
                            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 transition-transform group-hover:scale-110">
                                <Video size={40} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-black uppercase italic tracking-tighter">Watch Video</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">YouTube Clips</p>
                            </div>
                        </button>
                        <button
                            onClick={() => setMode('audio')}
                            className="group flex-1 flex flex-col items-center gap-4 rounded-2xl border-4 border-black bg-white p-8 transition-all hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:scale-95"
                        >
                            <div className="h-20 w-20 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 transition-transform group-hover:scale-110">
                                <Headphones size={40} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-black uppercase italic tracking-tighter">Listen Only</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hi-Fi Audio</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Mode Switcher */}
            {hasBoth && mode !== null && (
                <div className="flex justify-center animate-in fade-in duration-500">
                    <div className="inline-flex rounded-full bg-slate-900 p-1 border border-slate-800 shadow-xl">
                        <button
                            onClick={() => setMode('video')}
                            className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all ${mode === 'video' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Video size={16} />
                            Watch
                        </button>
                        <button
                            onClick={() => setMode('audio')}
                            className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all ${mode === 'audio' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Headphones size={16} />
                            Listen
                        </button>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div ref={containerRef} className="relative">
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
                            <div className="flex-1">
                                <h4 className="font-bold text-white">Audio Experience</h4>
                                <p className="text-xs text-slate-500">Hi-Fi Audio Player</p>
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

                {!audioUrl && !youtubeVideoId && mode !== null && (
                    <div className="animate-in fade-in zoom-in-95 duration-500 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/10 p-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-slate-500">
                            <Headphones size={32} className="opacity-20" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-200">No Media Available</h4>
                        <p className="mt-2 text-sm text-slate-500">This episode might be text-only.</p>
                    </div>
                )}
            </div>

            {/* Sticky Player */}
            {isSticky && mode === 'audio' && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t-4 border-black bg-white p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
                    <div className="mx-auto flex max-w-4xl items-center gap-4">
                        <button
                            onClick={togglePlay}
                            className="flex h-14 w-14 flex-shrink-0 items-center justify-center border-4 border-black bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>
                        <div className="flex-1 min-w-0">
                            <h4 className="truncate text-sm font-black uppercase tracking-tighter italic">{title}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold font-mono">{formatTime(currentTime)}</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 100}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-black"
                                />
                                <span className="text-[10px] font-bold font-mono">{formatTime(duration)}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSticky(false)}
                            className="h-10 w-10 flex items-center justify-center border-2 border-black hover:bg-slate-100"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Show Notes */}
            <section className="prose prose-invert max-w-none rounded-3xl border-4 border-foreground bg-background p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-8 border-b-4 border-foreground pb-6">
                    <div className="h-10 w-10 bg-primary flex items-center justify-center border-2 border-black rotate-3">
                        <Clock size={20} className="text-primary-foreground" />
                    </div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter m-0">Show Notes</h3>
                </div>
                <div
                    onClick={handleDescClick}
                    className="text-lg leading-relaxed text-muted-foreground space-y-6"
                    dangerouslySetInnerHTML={{ __html: processedDescription }}
                />
            </section>
        </div>
    );
}
