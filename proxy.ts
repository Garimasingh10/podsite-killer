// proxy.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || 'localhost:3000';

    // 1. Domain Routing Logic
    const isMainApp =
        hostname === 'localhost:3000' ||
        hostname === process.env.NEXT_PUBLIC_APP_DOMAIN ||
        hostname === 'app.podsitekiller.com' ||
        hostname.includes('vercel.app');

    // If it's a custom domain, we rewrite to the specific podcast route
    if (!isMainApp && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.includes('.')) {
        const cleanHostname = hostname.replace('www.', '');
        return NextResponse.rewrite(new URL(`/${cleanHostname}${pathname === '/' ? '' : pathname}`, request.url));
    }

    // Skip static assets and internal requests for the rest of the logic
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    console.log(`--- Proxy Hit: ${pathname} [Host: ${hostname}] ---`);

    // 2. Initial Collector for Auth state sync
    const pendingCookies: { name: string; value: string; options?: any }[] = [];
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 3. Setup Supabase
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

    // 4. Trigger check
    const { data: { user } } = await supabase.auth.getUser();

    // 5. Manually staple ANY cookies collected during getUser
    if (pendingCookies.length > 0) {
        console.log('Proxy - Stapling collected cookies to outbound response:', pendingCookies.length);
        pendingCookies.forEach(({ name, value, options }) => {
            const cookieStr = [
                `${name}=${value}`,
                `Path=${options?.path ?? '/'}`,
                'SameSite=Lax',
                `Max-Age=${options?.maxAge ?? 3600}`,
                process.env.NODE_ENV === 'production' ? 'Secure' : '',
            ].filter(Boolean).join('; ');
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
