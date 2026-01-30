import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  console.log('Auth Callback Hit:', request.url);

  if (code) {
    // Create a response first so we can attach cookies to it
    const response = NextResponse.redirect(`${requestUrl.origin}${next}`);

    // Create a supabase client that writes to the RESPONSE object
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            console.log('Auth Callback: Writing cookies to response...', cookiesToSet.map(c => c.name));
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, {
                ...options,
                path: '/',
              })
            );
          },
        },
      }
    );

    console.log('Auth Callback: Exchanging code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth Callback: Exchange Error:', error.message);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data?.session) {
      console.log('Auth Callback: Session established for user:', data.user?.id);
      // The cookies are now in the 'response' object thanks to setAll
      return response;
    } else {
      console.warn('Auth Callback: No session returned from exchange!');
      return NextResponse.redirect(`${requestUrl.origin}/login?error=no_session`);
    }
  }

  // No code → just go back to login
  console.log('No code found in callback, redirecting to login');
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
