// lib/supabaseServer.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        async setAll(cookiesToSet) {
          try {
            await Promise.all(
              cookiesToSet.map(async ({ name, value, options }) => {
                await cookieStore.set(name, value, {
                  ...options,
                  path: '/',
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                });
              })
            );
          } catch {
            // ignore
          }
        },
      },
    }
  );
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error('getCurrentUser error', error);
  }

  return data.user ?? null;
}
