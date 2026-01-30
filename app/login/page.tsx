'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser';

const DASHBOARD = '/dashboard';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const errorFromUrl = searchParams.get('error');
  const displayMessage =
    message ?? (errorFromUrl ? decodeURIComponent(errorFromUrl) : null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            DASHBOARD,
          )}`,
        },
      });
      console.log('signUp result', error);
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
      setMessage('Check your email to confirm your account, then log in.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('signIn result', { data, error });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push(DASHBOARD);
    router.refresh(); // Ensure the layout refreshes the session state
  };

  const onGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);

    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
          DASHBOARD,
        )}`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else if (!data?.url) {
      setMessage('Could not start Google login.');
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      {/* soft background glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_#0ea5e933,_transparent_60%),radial-gradient(circle_at_bottom,_#6366f133,_transparent_55%)]" />

      <div className="relative w-full max-w-md">
        {/* top logo + subtitle */}
        <div className="mb-6 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            PodSite-Killer
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-50">
            {isSignUp ? 'Create your studio account' : 'Sign in to your studio'}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Import RSS, sync episodes, and manage YouTube from one dashboard.
          </p>
        </div>

        {/* card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/85 px-6 py-6 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-medium text-sky-400 hover:text-sky-300"
                >
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 pr-10 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    // eye
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path
                        fillRule="evenodd"
                        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    // eye-off
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                      <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                      <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.702 7.69 10.677 7.69.612 0 1.209-.046 1.793-.135l-3.563-3.563A5.25 5.25 0 016.75 12z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {displayMessage && (
              <p className="rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-300">
                {displayMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm shadow-sky-500/40 hover:bg-sky-400 disabled:opacity-60"
            >
              {loading
                ? isSignUp
                  ? 'Creating account…'
                  : 'Signing in…'
                : isSignUp
                ? 'Sign up'
                : 'Login'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-800" aria-hidden />
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              or
            </span>
            <span className="h-px flex-1 bg-slate-800" aria-hidden />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onGoogleLogin}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-sm font-medium text-slate-100 hover:border-slate-500 hover:bg-slate-900 disabled:opacity-60"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center">
              <span className="h-4 w-4 rounded-[4px] bg-gradient-to-br from-sky-400 via-emerald-400 to-amber-400" />
            </span>
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="font-medium text-sky-400 hover:underline"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                No account yet?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="font-medium text-sky-400 hover:underline"
                >
                  Sign up
                </button>{' '}
                with email, or use Google above.
              </>
            )}
          </p>

          <p className="mt-2 text-center text-xs text-slate-500">
            <Link href="/" className="text-sky-400 hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
