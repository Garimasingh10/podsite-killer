// app/login/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const DASHBOARD = '/dashboard';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
      setMessage('Check your email to confirm your account, then log in.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    window.location.href = DASHBOARD;
  };

  const onGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-50">PodSite-Killer</h1>
          <p className="mt-1 text-sm text-slate-400">
            {isSignUp ? 'Create an account' : 'Sign in to manage your podcasts'}
          </p>
        </header>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300"
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
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {displayMessage && (
            <p className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-400">
              {displayMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-sky-400 disabled:opacity-60"
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
          <span className="h-px flex-1 bg-slate-700" aria-hidden />
          <span className="text-xs text-slate-500">or</span>
          <span className="h-px flex-1 bg-slate-700" aria-hidden />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={onGoogleLogin}
          className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-60"
        >
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
    </main>
  );
}
