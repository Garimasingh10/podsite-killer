// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { SignOutButton } from './_components/SignOutButton';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) console.error('Dashboard Layout - Auth Error:', error.message);

  if (error || !user) {
    console.log('Dashboard Layout - No user or error, redirecting to /login');
    redirect('/login');
  }


  // Robust name detection for different providers (Google vs Email)
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.user_name ||
    user.email?.split('@')[0] ||
    'Studio Creator';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      {/* Top glass header */}
      <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/70 to-cyan-400/70 text-xs font-bold text-slate-950 shadow-lg shadow-sky-500/30">
              PK
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                PodSite‑Killer
              </p>
              <p className="text-xs text-slate-300">
                Hello <span className="font-medium text-slate-100">{displayName}</span>, your podcast site studio.
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-[11px] text-slate-400">
            <Link
              href="/dashboard"
              className="rounded-full border border-transparent px-3 py-1 hover:border-sky-500 hover:bg-slate-900/60 hover:text-sky-400"
            >
              Dashboard
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>

      {/* Page body */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
