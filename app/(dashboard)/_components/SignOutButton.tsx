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
            className="rounded-full border border-slate-800/70 px-3 py-1 text-[11px] font-medium text-slate-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
            Sign Out
        </button>
    );
}
