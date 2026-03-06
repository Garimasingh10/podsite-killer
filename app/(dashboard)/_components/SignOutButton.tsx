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
            className="hover:text-white transition-colors"
        >
            Sign Out
        </button>
    );
}
