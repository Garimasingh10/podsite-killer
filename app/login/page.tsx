// app/login/page.tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        console.log('trying login', { email, passwordLength: password.length });

        const { error } = await supabaseBrowser.auth.signInWithPassword({
          email,
          password,
        });

        console.log('login error', error);

        if (error) {
          console.error('supabase login error', error);
          setError(error.message);
          return;
        }

        console.log('login success, going to /dashboard');

        router.push('/dashboard');
        router.refresh(); // force server components to see new session [web:297][web:298]
      } else {
        const { error } = await supabaseBrowser.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error('supabase signup error', error);
          setError(error.message);
          return;
        }

        setError('Account created. Check your email if confirmation is required, then log in.');
        setMode('login');
      }
    } catch (err: any) {
      console.error('unexpected auth error', err);
      setError(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#050816] text-slate-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-slate-900 p-6 shadow-lg space-y-4"
      >
        <h1 className="text-xl font-semibold">
          PodSite-Killer {mode === 'login' ? 'Login' : 'Sign up'}
        </h1>

        {error && (
          <p className="text-xs text-red-400">
            {error}
          </p>
        )}

        <label className="block text-xs text-slate-400 space-y-1">
          <span>Email</span>
          <input
            type="email"
            className="w-full rounded bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <div className="block text-xs text-slate-400 space-y-1">
          <span>Password</span>
          <div className="flex items-center gap-2">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="rounded border border-slate-600 px-2 py-1 text-[11px] hover:border-sky-400"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-300 disabled:opacity-60"
          >
            {loading ? 'Working…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="flex-1 rounded border border-slate-600 px-3 py-2 text-sm hover:border-sky-400 disabled:opacity-60"
          >
            {mode === 'login' ? 'Need an account?' : 'Have an account?'}
          </button>
        </div>
      </form>
    </main>
  );
}
