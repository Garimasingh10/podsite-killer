// app/login/page.tsx
'use client';

import React, { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });
    console.log('login result', { data, error });

    setLoading(false);

    if (error) {
      console.log('login error', error);
      setError(error.message);
    } else {
      console.log('login success, redirecting to /');
      router.push('/');
    }
  }

  async function handleSignup(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabaseBrowser.auth.signUp({
      email,
      password,
    });
    console.log('signup result', { data, error });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setError(
        'Account created. Now log in with the same email and password.',
      );
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#050816] text-slate-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-xl bg-slate-900 p-6 shadow-lg"
      >
        <h1 className="mb-4 text-xl font-semibold">PodSite-Killer Login</h1>

        <label className="mb-2 block text-xs text-slate-400">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="mb-4 block text-xs text-slate-400">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && (
          <p className="mb-3 text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-300 disabled:opacity-60"
          >
            {loading ? 'Working…' : 'Log in'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSignup}
            className="flex-1 rounded border border-slate-600 px-3 py-2 text-sm hover:border-sky-400 disabled:opacity-60"
          >
            Sign up
          </button>
        </div>
      </form>
    </main>
  );
}
