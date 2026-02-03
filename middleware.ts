import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip static assets and internal requests
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const host = request.headers.get('host');
    console.log(`--- Proxy Hit: ${pathname} [Host: ${host}] ---`);

    // 1. Initial Collector
    const pendingCookies: any[] = [];
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 2. Setup Supabase
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    console.log('Proxy - Collecting state sync:', cookiesToSet.map(c => c.name));
                    pendingCookies.push(...cookiesToSet);

                    // a) Update request object
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    // b) Sync headers for downstream
                    const cookieString = request.cookies.getAll()
                        .map(c => `${c.name}=${c.value}`)
                        .join('; ');

                    const newRequestHeaders = new Headers(request.headers);
                    newRequestHeaders.set('Cookie', cookieString);

                    // c) Refresh response to carry new headers
                    response = NextResponse.next({
                        request: {
                            headers: newRequestHeaders,
                        },
                    });
                },
            },
        },
    );

    // 3. Trigger check
    const { data: { user } } = await supabase.auth.getUser();

    // 4. Manually staple ANY cookies collected during getUser
    if (pendingCookies.length > 0) {
        console.log('Proxy - Stapling collected cookies to outbound response:', pendingCookies.length);
        pendingCookies.forEach(({ name, value, options }) => {
            const cookieStr = [
                `${name}=${value}`,
                `Path=${options?.path ?? '/'}`,
                'SameSite=Lax',
                `Max-Age=${options?.maxAge ?? 3600}`,
            ].join('; ');
            response.headers.append('Set-Cookie', cookieStr);
        });
    }

    const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/podcasts');

    if (user) {
        console.log('Proxy - Active session:', user.id);
        if (pathname === '/login' || pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    } else {
        console.log('Proxy - No active session');
        if (isDashboard) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
