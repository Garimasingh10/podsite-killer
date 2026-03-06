'use client';

import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    return (
        <button
            onClick={handleSignOut}
            className="rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-all shadow-sm"
        >
            Sign Out
        </button>
    );
}
