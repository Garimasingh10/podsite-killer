import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    console.log('--- Proxy Hit ---', request.nextUrl.pathname);

    const cookieStore = request.cookies;
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                    });

                    // We must return a NEW response if we set cookies
                    // However, we can just mutate the existing response object for Next.js to pick up
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, {
                            ...options,
                            path: '/',
                        });
                    });
                },
            },
        }
    );

    // This will refresh the session if it's expired
    const { data: { user }, error } = await supabase.auth.getUser();

    if (user) {
        console.log('Proxy - Authenticated User:', user.id);
    } else {
        console.log('Proxy - No Session Found', error?.message || '');
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
