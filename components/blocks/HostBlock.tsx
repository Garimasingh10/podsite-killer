// components/blocks/HostBlock.tsx
import React from 'react';

export default function HostBlock({ podcast }: { podcast: any }) {
    return (
        <section className="mb-12 flex flex-col items-center gap-8 rounded-2xl border border-border bg-secondary/20 p-8 md:flex-row md:items-start">
            <div className="shrink-0 overflow-hidden rounded-full border-4 border-primary">
                <div className="h-32 w-32 bg-muted flex items-center justify-center text-4xl">
                    👤
                </div>
            </div>
            <div>
                <h3 className="mb-2 text-2xl font-bold">About the Host</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    The brilliant mind behind <strong>{podcast.title}</strong>.
                    Sharing insights, stories, and deep dives into the topics that matter most.
                    Join the conversation every week.
                </p>
                <div className="mt-6 flex gap-4">
                    {/* Social Icons Placeholder */}
                    <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center text-background">𝕏</div>
                    <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center text-background">in</div>
                </div>
            </div>
        </section>
    );
}
