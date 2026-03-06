// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import Link from 'next/link';
import { SignOutButton } from './_components/SignOutButton';
import { SearchForm } from './_components/SearchForm';
import { Layout, Heart, Headphones, Globe, Zap } from 'lucide-react';

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

  if (error) {
    console.error('Dashboard Layout - Auth Error:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });

    // Handle specific auth errors
    if (error.message.includes('JWT') || error.message.includes('token') || error.message.includes('expired')) {
      // Session expired or invalid - redirect to login with clear message
      redirect('/login?error=' + encodeURIComponent('Session expired. Please log in again.'));
    }
  }

  if (error || !user) {
    console.log('Dashboard Layout - No user or error, redirecting to /login', {
      hasError: !!error,
      hasUser: !!user,
      errorMessage: error?.message,
    });
    redirect('/login');
  }

  // Verify user has valid email (required for account)
  if (!user.email) {
    console.error('Dashboard Layout - User has no email');
    redirect('/login?error=' + encodeURIComponent('Account configuration error. Please contact support.'));
  }


  // Robust name detection for different providers (Google vs Email)
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.user_name ||
    user.email?.split('@')[0] ||
    'Studio Creator';

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 mesh-gradient opacity-60" />
      <div className="fixed inset-0 z-0 grid-pattern opacity-[0.05]" />

      {/* Top glass header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="group flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-black text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]">
                PK
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-white">
                  PodSite Studio
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-slate-400">
                    <span className="text-slate-100">{displayName}</span>
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-4">
            <SearchForm 
              initialQuery="" 
              placeholder="Search..." 
              className="w-full max-w-xs scale-90 opacity-60 transition-all focus-within:opacity-100 focus-within:scale-100" 
            />
          </div>

          <nav className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Link
              href="/dashboard"
              className="group flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 transition-all hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400"
            >
              <Layout size={10} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/products"
              className="group flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-400"
            >
              <Zap size={10} />
              <span>Products</span>
            </Link>
            <Link
              href="/dashboard/domains"
              className="group flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"
            >
              <Globe size={10} />
              <span>Domains</span>
            </Link>
            <Link
              href="/dashboard?favorites=true"
              className="group flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 transition-all hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-400"
            >
              <Heart size={10} className="fill-current" />
              <span>Favorites</span>
            </Link>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <SignOutButton />
          </nav>
        </div>
      </header>

      {/* Page body */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
